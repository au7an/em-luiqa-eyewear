-- ==============================================================================
-- JEM LUIQA EYEWEAR - SUPABASE DATABASE SCHEMA & RLS POLICIES
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop legacy/existing tables in reverse dependency order if migrating
DROP TABLE IF EXISTS public.lookbook_media CASCADE;
DROP TABLE IF EXISTS public.lookbook_collections CASCADE;
DROP TABLE IF EXISTS public.product_images CASCADE;
DROP TABLE IF EXISTS public.product_occasions CASCADE;
DROP TABLE IF EXISTS public.product_face_shapes CASCADE;
DROP TABLE IF EXISTS public.product_variants CASCADE;
DROP TABLE IF EXISTS public.products CASCADE;
DROP TABLE IF EXISTS public.occasions CASCADE;
DROP TABLE IF EXISTS public.face_shapes CASCADE;
DROP TABLE IF EXISTS public.frame_shapes CASCADE;
DROP TABLE IF EXISTS public.campaigns CASCADE;
DROP TABLE IF EXISTS public.lens_services CASCADE;
DROP TABLE IF EXISTS public.promotions CASCADE;
DROP TABLE IF EXISTS public.inquiries CASCADE;
DROP TABLE IF EXISTS public.site_settings CASCADE;

-- ------------------------------------------------------------------------------
-- 0. DISCOVERY TAXONOMY TABLES
-- ------------------------------------------------------------------------------
CREATE TABLE public.frame_shapes (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    sort_order INTEGER DEFAULT 0,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE public.face_shapes (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    sort_order INTEGER DEFAULT 0,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE public.occasions (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    sort_order INTEGER DEFAULT 0,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ------------------------------------------------------------------------------
-- 1. PRODUCTS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE public.products (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    sku TEXT,
    category TEXT NOT NULL CHECK (category IN ('sunglasses', 'optical')),
    edition TEXT,
    short_description TEXT,
    description TEXT,
    price TEXT NOT NULL,
    compare_at_price TEXT,
    currency TEXT DEFAULT 'IDR',
    badge TEXT,
    material TEXT,
    frame_shape TEXT,
    frame_shape_id TEXT REFERENCES public.frame_shapes(id) ON DELETE SET NULL,
    color TEXT,
    lens_width TEXT,
    bridge_width TEXT,
    temple_length TEXT,
    overall_width TEXT,
    lens_height TEXT,
    weight TEXT,
    lens_compatible BOOLEAN DEFAULT true,
    stock_status TEXT NOT NULL DEFAULT 'Available' CHECK (stock_status IN ('Available', 'Low Stock', 'Sold Out', 'Coming Soon')),
    featured BOOLEAN DEFAULT false,
    published BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    shopee_url TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ------------------------------------------------------------------------------
-- 1B. PRODUCT VARIANTS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE public.product_variants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id TEXT NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    color_name TEXT NOT NULL,
    color_hex TEXT NOT NULL,
    swatch_image_url TEXT,
    sku TEXT,
    price TEXT, -- Optional price override
    compare_at_price TEXT,
    stock_status TEXT NOT NULL DEFAULT 'Available' CHECK (stock_status IN ('Available', 'Low Stock', 'Sold Out', 'Coming Soon')),
    shopee_url TEXT,
    is_active BOOLEAN DEFAULT true,
    is_default BOOLEAN DEFAULT false,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_product_variants_product_id ON public.product_variants(product_id);

-- ------------------------------------------------------------------------------
-- 1C. PRODUCT TAXONOMY JUNCTION TABLES
-- ------------------------------------------------------------------------------
CREATE TABLE public.product_face_shapes (
    product_id TEXT NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    face_shape_id TEXT NOT NULL REFERENCES public.face_shapes(id) ON DELETE CASCADE,
    PRIMARY KEY (product_id, face_shape_id)
);

CREATE TABLE public.product_occasions (
    product_id TEXT NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    occasion_id TEXT NOT NULL REFERENCES public.occasions(id) ON DELETE CASCADE,
    PRIMARY KEY (product_id, occasion_id)
);

-- ------------------------------------------------------------------------------
-- 2. PRODUCT IMAGES TABLE (Supports base product and variant images)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.product_images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id TEXT NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    variant_id UUID REFERENCES public.product_variants(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    alt_text TEXT,
    image_type TEXT DEFAULT 'Primary' CHECK (image_type IN ('Primary', 'Front', 'Side', 'Detail', 'Campaign', 'Lifestyle')),
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_product_images_product_id ON public.product_images(product_id);
CREATE INDEX IF NOT EXISTS idx_product_images_variant_id ON public.product_images(variant_id);

-- ------------------------------------------------------------------------------
-- 3. CAMPAIGNS (HERO CAROUSEL & BANNERS) TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.campaigns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    eyebrow TEXT,
    title TEXT NOT NULL,
    description TEXT,
    desktop_media_url TEXT NOT NULL,
    mobile_media_url TEXT,
    media_type TEXT DEFAULT 'image' CHECK (media_type IN ('image', 'video')),
    primary_cta_label TEXT DEFAULT 'Shop Now',
    primary_cta_url TEXT DEFAULT '/catalog',
    secondary_cta_label TEXT DEFAULT 'Explore Lookbook',
    secondary_cta_url TEXT DEFAULT '/lookbook',
    object_position_desktop TEXT DEFAULT 'center',
    object_position_mobile TEXT DEFAULT 'center',
    autoplay_duration INTEGER DEFAULT 6000,
    sort_order INTEGER DEFAULT 0,
    active BOOLEAN DEFAULT true,
    start_date TIMESTAMPTZ,
    end_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ------------------------------------------------------------------------------
-- 4. LENS SERVICES TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.lens_services (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('Single Vision', 'Bifocal', 'Progressive', 'Specialty')),
    short_description TEXT,
    description TEXT,
    starting_price TEXT,
    currency TEXT DEFAULT 'IDR',
    features JSONB DEFAULT '[]'::jsonb,
    recommended_for TEXT,
    sort_order INTEGER DEFAULT 0,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ------------------------------------------------------------------------------
-- 5. PROMOTIONS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.promotions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    subtitle TEXT,
    description TEXT,
    price_label TEXT,
    image_url TEXT,
    cta_label TEXT DEFAULT 'Inquire Promotion',
    cta_url TEXT,
    active BOOLEAN DEFAULT true,
    start_date TIMESTAMPTZ,
    end_date TIMESTAMPTZ,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ------------------------------------------------------------------------------
-- 6. LOOKBOOK COLLECTIONS & MEDIA TABLES
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.lookbook_collections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    subtitle TEXT,
    description TEXT,
    cover_image_url TEXT,
    published BOOLEAN DEFAULT true,
    featured BOOLEAN DEFAULT false,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.lookbook_media (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lookbook_id UUID NOT NULL REFERENCES public.lookbook_collections(id) ON DELETE CASCADE,
    media_url TEXT NOT NULL,
    media_type TEXT DEFAULT 'image' CHECK (media_type IN ('image', 'video')),
    caption TEXT,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_lookbook_media_collection_id ON public.lookbook_media(lookbook_id);

-- ------------------------------------------------------------------------------
-- 7. CONTACT INQUIRIES TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.inquiries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    subject TEXT,
    message TEXT NOT NULL,
    status TEXT DEFAULT 'New' CHECK (status IN ('New', 'Read', 'Replied', 'Closed')),
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_inquiries_status ON public.inquiries(status);

-- ------------------------------------------------------------------------------
-- 8. SITE SETTINGS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.site_settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ------------------------------------------------------------------------------
-- ROW LEVEL SECURITY (RLS)
-- ------------------------------------------------------------------------------

ALTER TABLE public.frame_shapes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.face_shapes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.occasions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_face_shapes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_occasions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lens_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promotions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lookbook_collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lookbook_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Discovery Taxonomy Policies
CREATE POLICY "Public can view active frame shapes"
    ON public.frame_shapes FOR SELECT
    USING (active = true OR auth.role() = 'authenticated');

CREATE POLICY "Admin full access to frame shapes"
    ON public.frame_shapes FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Public can view active face shapes"
    ON public.face_shapes FOR SELECT
    USING (active = true OR auth.role() = 'authenticated');

CREATE POLICY "Admin full access to face shapes"
    ON public.face_shapes FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Public can view active occasions"
    ON public.occasions FOR SELECT
    USING (active = true OR auth.role() = 'authenticated');

CREATE POLICY "Admin full access to occasions"
    ON public.occasions FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Product Variants Policies
CREATE POLICY "Public can view active product variants"
    ON public.product_variants FOR SELECT
    USING (is_active = true OR auth.role() = 'authenticated');

CREATE POLICY "Admin full access to product variants"
    ON public.product_variants FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Product Taxonomy Junction Policies
CREATE POLICY "Public can view product face shapes"
    ON public.product_face_shapes FOR SELECT
    USING (true);

CREATE POLICY "Admin full access to product face shapes"
    ON public.product_face_shapes FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Public can view product occasions"
    ON public.product_occasions FOR SELECT
    USING (true);

CREATE POLICY "Admin full access to product occasions"
    ON public.product_occasions FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Products Policies
CREATE POLICY "Public can view published products"
    ON public.products FOR SELECT
    USING (published = true OR auth.role() = 'authenticated');

CREATE POLICY "Admin full access to products"
    ON public.products FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Product Images Policies
CREATE POLICY "Public can view product images"
    ON public.product_images FOR SELECT
    USING (true);

CREATE POLICY "Admin full access to product images"
    ON public.product_images FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Campaigns Policies
CREATE POLICY "Public can view active campaigns"
    ON public.campaigns FOR SELECT
    USING (
        (active = true AND (start_date IS NULL OR start_date <= now()) AND (end_date IS NULL OR end_date >= now()))
        OR auth.role() = 'authenticated'
    );

CREATE POLICY "Admin full access to campaigns"
    ON public.campaigns FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Lens Services Policies
CREATE POLICY "Public can view active lens services"
    ON public.lens_services FOR SELECT
    USING (active = true OR auth.role() = 'authenticated');

CREATE POLICY "Admin full access to lens services"
    ON public.lens_services FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Promotions Policies
CREATE POLICY "Public can view active promotions"
    ON public.promotions FOR SELECT
    USING (
        (active = true AND (start_date IS NULL OR start_date <= now()) AND (end_date IS NULL OR end_date >= now()))
        OR auth.role() = 'authenticated'
    );

CREATE POLICY "Admin full access to promotions"
    ON public.promotions FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Lookbook Policies
CREATE POLICY "Public can view published lookbook collections"
    ON public.lookbook_collections FOR SELECT
    USING (published = true OR auth.role() = 'authenticated');

CREATE POLICY "Admin full access to lookbook collections"
    ON public.lookbook_collections FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Public can view lookbook media"
    ON public.lookbook_media FOR SELECT
    USING (true);

CREATE POLICY "Admin full access to lookbook media"
    ON public.lookbook_media FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Inquiries Policies
CREATE POLICY "Public can submit inquiries"
    ON public.inquiries FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Admin can view and manage inquiries"
    ON public.inquiries FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Site Settings Policies
CREATE POLICY "Public can view site settings"
    ON public.site_settings FOR SELECT
    USING (true);

CREATE POLICY "Admin full access to site settings"
    ON public.site_settings FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- ------------------------------------------------------------------------------
-- STORAGE BUCKETS (Run in Supabase SQL editor or Dashboard)
-- ------------------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public) 
VALUES 
    ('products', 'products', true),
    ('campaigns', 'campaigns', true),
    ('lookbook', 'lookbook', true),
    ('promotions', 'promotions', true)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS
DROP POLICY IF EXISTS "Public can view storage files" ON storage.objects;
DROP POLICY IF EXISTS "Admin can upload files to storage" ON storage.objects;
DROP POLICY IF EXISTS "Admin can update files in storage" ON storage.objects;
DROP POLICY IF EXISTS "Admin can delete files in storage" ON storage.objects;

CREATE POLICY "Public can view storage files"
    ON storage.objects FOR SELECT
    USING (bucket_id IN ('products', 'campaigns', 'lookbook', 'promotions'));

CREATE POLICY "Admin can upload files to storage"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (bucket_id IN ('products', 'campaigns', 'lookbook', 'promotions'));

CREATE POLICY "Admin can update files in storage"
    ON storage.objects FOR UPDATE
    TO authenticated
    USING (bucket_id IN ('products', 'campaigns', 'lookbook', 'promotions'));

CREATE POLICY "Admin can delete files in storage"
    ON storage.objects FOR DELETE
    TO authenticated
    USING (bucket_id IN ('products', 'campaigns', 'lookbook', 'promotions'));

