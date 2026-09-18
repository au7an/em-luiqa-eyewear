-- ==============================================================================
-- JEM LUIQA EYEWEAR - SECURITY AUDIT LOG SYSTEM MIGRATION
-- ==============================================================================
-- Creates append-only security audit log table, RLS policies, indexing,
-- and automated PostgreSQL triggers across all core CMS modules.

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ------------------------------------------------------------------------------
-- 1. AUDIT LOGS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    actor_user_id UUID NULL,
    actor_email TEXT NULL,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id TEXT NULL,
    entity_label TEXT NULL,
    before_data JSONB NULL,
    after_data JSONB NULL,
    metadata JSONB NULL,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Indexes for lightning fast filtering, sorting, and reporting
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_actor_user_id ON public.audit_logs(actor_user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON public.audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity_type ON public.audit_logs(entity_type);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity_id ON public.audit_logs(entity_id);

-- ------------------------------------------------------------------------------
-- 2. ADMIN VERIFICATION HELPER & RLS POLICIES
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT (
    auth.role() = 'authenticated'
    OR COALESCE(auth.jwt() -> 'app_metadata' ->> 'role', '') = 'admin'
    OR COALESCE(auth.jwt() ->> 'role', '') = 'service_role'
  );
$$;

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Allow SELECT to authenticated administrators (matching products and CMS tables)
DROP POLICY IF EXISTS "Admins can view audit logs" ON public.audit_logs;
CREATE POLICY "Admins can view audit logs"
    ON public.audit_logs FOR SELECT
    TO authenticated
    USING (true);

-- NO public/authenticated INSERT, UPDATE, or DELETE policies are granted.
-- Audit logs are strictly append-only and written solely via SECURITY DEFINER triggers.

-- ------------------------------------------------------------------------------
-- 3. SENSITIVE DATA REDACTION HELPER
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.redact_sensitive_audit_data(val JSONB)
RETURNS JSONB
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT CASE 
    WHEN val IS NULL THEN NULL
    ELSE val 
      - 'password' 
      - 'secret' 
      - 'token' 
      - 'access_token' 
      - 'refresh_token' 
      - 'service_role' 
      - 'api_key' 
      - 'supabase_secret'
  END;
$$;

-- ------------------------------------------------------------------------------
-- 4. UNIVERSAL AUDIT TRIGGER FUNCTION
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.process_audit_log()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_actor_id UUID;
    v_actor_email TEXT;
    v_action TEXT;
    v_entity_type TEXT;
    v_entity_id TEXT;
    v_entity_label TEXT;
    v_before_data JSONB;
    v_after_data JSONB;
    v_rec_json JSONB;
    v_old_json JSONB;
    v_new_json JSONB;
    v_parent_name TEXT;
BEGIN
    -- 1. Identify Actor
    v_actor_id := auth.uid();
    v_actor_email := COALESCE(
        auth.jwt() ->> 'email',
        (SELECT email FROM auth.users WHERE id = v_actor_id LIMIT 1)
    );

    v_entity_type := TG_TABLE_NAME;

    -- 2. Safely parse OLD and NEW records into JSONB
    IF (TG_OP = 'DELETE') THEN
        v_old_json := to_jsonb(OLD);
        v_new_json := NULL;
        v_rec_json := v_old_json;
    ELSIF (TG_OP = 'INSERT') THEN
        v_old_json := NULL;
        v_new_json := to_jsonb(NEW);
        v_rec_json := v_new_json;
    ELSE
        v_old_json := to_jsonb(OLD);
        v_new_json := to_jsonb(NEW);
        v_rec_json := v_new_json;
    END IF;

    -- 3. Determine Entity ID
    IF (v_entity_type = 'site_settings') THEN
        v_entity_id := v_rec_json ->> 'key';
    ELSE
        v_entity_id := v_rec_json ->> 'id';
    END IF;

    -- 4. Calculate Smart Action & Filter Out Meaningless Updates
    IF (TG_OP = 'INSERT') THEN
        v_action := 'CREATE';
        v_before_data := NULL;
        v_after_data := public.redact_sensitive_audit_data(v_new_json);
    ELSIF (TG_OP = 'DELETE') THEN
        v_action := 'DELETE';
        v_before_data := public.redact_sensitive_audit_data(v_old_json);
        v_after_data := NULL;
    ELSIF (TG_OP = 'UPDATE') THEN
        -- Check if only updated_at changed or no meaningful field changed
        IF (v_old_json - 'updated_at') = (v_new_json - 'updated_at') THEN
            RETURN NEW;
        END IF;

        -- Check for smart action semantics using JSONB (prevents "record old has no field" on tables without specific columns)
        IF (v_old_json ? 'published') AND ((v_old_json ->> 'published') IS DISTINCT FROM (v_new_json ->> 'published')) THEN
            IF COALESCE((v_new_json ->> 'published')::boolean, false) = true THEN
                v_action := 'PUBLISH';
            ELSE
                v_action := 'UNPUBLISH';
            END IF;
        ELSIF (v_old_json ? 'active') AND ((v_old_json ->> 'active') IS DISTINCT FROM (v_new_json ->> 'active')) THEN
            IF COALESCE((v_new_json ->> 'active')::boolean, false) = true THEN
                v_action := 'ACTIVATE';
            ELSE
                v_action := 'DEACTIVATE';
            END IF;
        ELSIF (v_old_json ? 'is_active') AND ((v_old_json ->> 'is_active') IS DISTINCT FROM (v_new_json ->> 'is_active')) THEN
            IF COALESCE((v_new_json ->> 'is_active')::boolean, false) = true THEN
                v_action := 'ACTIVATE';
            ELSE
                v_action := 'DEACTIVATE';
            END IF;
        ELSE
            v_action := 'UPDATE';
        END IF;

        v_before_data := public.redact_sensitive_audit_data(v_old_json);
        v_after_data := public.redact_sensitive_audit_data(v_new_json);
    END IF;

    -- 5. Calculate Rich Hierarchical Entity Label
    IF (v_entity_type = 'products') THEN
        v_entity_label := COALESCE(v_rec_json ->> 'name', v_entity_id, 'Product');
    ELSIF (v_entity_type = 'product_variants') THEN
        SELECT name INTO v_parent_name FROM public.products WHERE id = (v_rec_json ->> 'product_id');
        v_entity_label := COALESCE(v_parent_name, 'Product') || ' — ' || COALESCE(v_rec_json ->> 'color_name', 'Variant');
    ELSIF (v_entity_type = 'product_images') THEN
        SELECT name INTO v_parent_name FROM public.products WHERE id = (v_rec_json ->> 'product_id');
        v_entity_label := COALESCE(v_parent_name, 'Product') || ' — ' || COALESCE(v_rec_json ->> 'image_type', 'Image');
    ELSIF (v_entity_type = 'campaigns') THEN
        v_entity_label := COALESCE(v_rec_json ->> 'name', v_rec_json ->> 'title', 'Campaign');
    ELSIF (v_entity_type = 'lens_services') THEN
        v_entity_label := COALESCE(v_rec_json ->> 'name', 'Lens Service');
    ELSIF (v_entity_type = 'promotions') THEN
        v_entity_label := COALESCE(v_rec_json ->> 'title', 'Promotion');
    ELSIF (v_entity_type = 'lookbook_collections') THEN
        v_entity_label := COALESCE(v_rec_json ->> 'title', 'Lookbook Collection');
    ELSIF (v_entity_type = 'lookbook_media') THEN
        BEGIN
            SELECT title INTO v_parent_name FROM public.lookbook_collections WHERE id = (v_rec_json ->> 'lookbook_id')::uuid;
        EXCEPTION WHEN OTHERS THEN
            v_parent_name := 'Lookbook';
        END;
        v_entity_label := COALESCE(v_parent_name, 'Lookbook') || ' — ' || COALESCE(v_rec_json ->> 'caption', 'Media Item');
    ELSIF (v_entity_type = 'site_settings') THEN
        v_entity_label := 'Settings (' || COALESCE(v_entity_id, 'general') || ')';
    ELSE
        v_entity_label := v_entity_type || ' ' || COALESCE(v_entity_id, '');
    END IF;

    -- 6. Insert Into Audit Logs
    INSERT INTO public.audit_logs (
        actor_user_id,
        actor_email,
        action,
        entity_type,
        entity_id,
        entity_label,
        before_data,
        after_data,
        metadata
    ) VALUES (
        v_actor_id,
        v_actor_email,
        v_action,
        v_entity_type,
        v_entity_id,
        v_entity_label,
        v_before_data,
        v_after_data,
        jsonb_build_object('source', 'pg_trigger', 'table', TG_TABLE_NAME)
    );

    IF (TG_OP = 'DELETE') THEN
        RETURN OLD;
    ELSE
        RETURN NEW;
    END IF;
END;
$$;

-- ------------------------------------------------------------------------------
-- 5. ATTACH TRIGGERS TO ALL CMS MODULES
-- ------------------------------------------------------------------------------

-- Products
DROP TRIGGER IF EXISTS trg_audit_products ON public.products;
CREATE TRIGGER trg_audit_products
    AFTER INSERT OR UPDATE OR DELETE ON public.products
    FOR EACH ROW EXECUTE FUNCTION public.process_audit_log();

-- Product Variants
DROP TRIGGER IF EXISTS trg_audit_product_variants ON public.product_variants;
CREATE TRIGGER trg_audit_product_variants
    AFTER INSERT OR UPDATE OR DELETE ON public.product_variants
    FOR EACH ROW EXECUTE FUNCTION public.process_audit_log();

-- Product Images
DROP TRIGGER IF EXISTS trg_audit_product_images ON public.product_images;
CREATE TRIGGER trg_audit_product_images
    AFTER INSERT OR UPDATE OR DELETE ON public.product_images
    FOR EACH ROW EXECUTE FUNCTION public.process_audit_log();

-- Campaigns
DROP TRIGGER IF EXISTS trg_audit_campaigns ON public.campaigns;
CREATE TRIGGER trg_audit_campaigns
    AFTER INSERT OR UPDATE OR DELETE ON public.campaigns
    FOR EACH ROW EXECUTE FUNCTION public.process_audit_log();

-- Lens Services
DROP TRIGGER IF EXISTS trg_audit_lens_services ON public.lens_services;
CREATE TRIGGER trg_audit_lens_services
    AFTER INSERT OR UPDATE OR DELETE ON public.lens_services
    FOR EACH ROW EXECUTE FUNCTION public.process_audit_log();

-- Promotions
DROP TRIGGER IF EXISTS trg_audit_promotions ON public.promotions;
CREATE TRIGGER trg_audit_promotions
    AFTER INSERT OR UPDATE OR DELETE ON public.promotions
    FOR EACH ROW EXECUTE FUNCTION public.process_audit_log();

-- Lookbook Collections
DROP TRIGGER IF EXISTS trg_audit_lookbook_collections ON public.lookbook_collections;
CREATE TRIGGER trg_audit_lookbook_collections
    AFTER INSERT OR UPDATE OR DELETE ON public.lookbook_collections
    FOR EACH ROW EXECUTE FUNCTION public.process_audit_log();

-- Lookbook Media
DROP TRIGGER IF EXISTS trg_audit_lookbook_media ON public.lookbook_media;
CREATE TRIGGER trg_audit_lookbook_media
    AFTER INSERT OR UPDATE OR DELETE ON public.lookbook_media
    FOR EACH ROW EXECUTE FUNCTION public.process_audit_log();

-- Site Settings
DROP TRIGGER IF EXISTS trg_audit_site_settings ON public.site_settings;
CREATE TRIGGER trg_audit_site_settings
    AFTER INSERT OR UPDATE OR DELETE ON public.site_settings
    FOR EACH ROW EXECUTE FUNCTION public.process_audit_log();

-- ------------------------------------------------------------------------------
-- 6. RELOAD POSTGREST SCHEMA CACHE
-- ------------------------------------------------------------------------------
NOTIFY pgrst, 'reload schema';
