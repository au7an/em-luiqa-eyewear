-- ==============================================================================
-- JEM LUIQA EYEWEAR - INCREMENTAL MIGRATION
-- Add Color Variants & Discovery Taxonomy to Existing Supabase Database
-- SAFE & IDEMPOTENT: Will not drop existing products or delete existing data!
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ------------------------------------------------------------------------------
-- 1. CREATE DISCOVERY TAXONOMY TABLES
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.frame_shapes (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    sort_order INTEGER DEFAULT 0,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.face_shapes (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    sort_order INTEGER DEFAULT 0,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.occasions (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    sort_order INTEGER DEFAULT 0,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Seed Discovery Taxonomy Master Rows
INSERT INTO public.frame_shapes (id, name, slug, description, sort_order, active) VALUES
('shape-round', 'Round', 'round', 'Soft circular curves defining timeless intellectual silhouettes', 1, true),
('shape-square', 'Square', 'square', 'Defined angles and structured horizontal architectural lines', 2, true),
('shape-hexagonal', 'Hexagonal', 'hexagonal', 'Architectural geometric contours with modern precision', 3, true),
('shape-aviator', 'Aviator', 'aviator', 'Double-bridge teardrop silhouette with classic presence', 4, true),
('shape-cat-eye', 'Cat-Eye', 'cat-eye', 'Uplifted outer rim angles creating sculptural drama', 5, true),
('shape-browline', 'Browline', 'browline', 'Prominent upper acetate rims balanced with sleek lower frame', 6, true),
('shape-shield-wrap', 'Shield / Wrap', 'shield-wrap', 'Continuous aerodynamic curve engineered for dynamic lifestyle', 7, true),
('shape-oval', 'Oval', 'oval', 'Elongated soft curves offering balanced proportions', 8, true)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description;

INSERT INTO public.face_shapes (id, name, slug, description, sort_order, active) VALUES
('face-oval', 'Oval Face', 'oval', 'Balanced symmetry suited for virtually all frame silhouettes', 1, true),
('face-round', 'Round Face', 'round', 'Complements angular, geometric, and square frames for definition', 2, true),
('face-square', 'Square Face', 'square', 'Harmonizes with round, oval, and curved silhouettes to soften jawline', 3, true),
('face-heart', 'Heart Face', 'heart', 'Accented by light bottom frames, aviators, and round contours', 4, true),
('face-diamond', 'Diamond Face', 'diamond', 'Emphasized by browlines, cat-eyes, and oval proportions', 5, true),
('face-oblong', 'Oblong Face', 'oblong', 'Balanced by tall lenses and wider geometric frames', 6, true)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description;

INSERT INTO public.occasions (id, name, slug, description, sort_order, active) VALUES
('occ-daily', 'Daily Wear', 'daily', 'Effortless versatility for everyday creative pursuits', 1, true),
('occ-business', 'Business & Formal', 'business', 'Refined structural elegance for leadership and client meetings', 2, true),
('occ-weekend', 'Casual Weekend', 'weekend', 'Relaxed sophistication for gallery walks and weekend cafes', 3, true),
('occ-travel', 'Outdoor & Travel', 'travel', 'High-contrast statement style engineered for sun and movement', 4, true),
('occ-screen', 'Screen & Digital Work', 'screen', 'Lightweight ergonomic comfort optimized for extended device focus', 5, true),
('occ-statement', 'Statement Event', 'statement', 'Striking architectural silhouettes curated for gala and evening wear', 6, true)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description;

-- ------------------------------------------------------------------------------
-- 2. ALTER PRODUCTS TABLE TO ADD FRAME SHAPE FOREIGN KEY
-- ------------------------------------------------------------------------------
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS frame_shape_id TEXT REFERENCES public.frame_shapes(id) ON DELETE SET NULL;

-- ------------------------------------------------------------------------------
-- 3. CREATE PRODUCT VARIANTS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.product_variants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id TEXT NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    color_name TEXT NOT NULL,
    color_hex TEXT NOT NULL,
    swatch_image_url TEXT,
    sku TEXT,
    price TEXT,
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
-- 4. ALTER PRODUCT IMAGES TO SUPPORT VARIANT SPECIFIC MEDIA
-- ------------------------------------------------------------------------------
ALTER TABLE public.product_images 
ADD COLUMN IF NOT EXISTS variant_id UUID REFERENCES public.product_variants(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_product_images_variant_id ON public.product_images(variant_id);

-- ------------------------------------------------------------------------------
-- 5. CREATE PRODUCT TAXONOMY JUNCTION TABLES
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.product_face_shapes (
    product_id TEXT NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    face_shape_id TEXT NOT NULL REFERENCES public.face_shapes(id) ON DELETE CASCADE,
    PRIMARY KEY (product_id, face_shape_id)
);

CREATE TABLE IF NOT EXISTS public.product_occasions (
    product_id TEXT NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    occasion_id TEXT NOT NULL REFERENCES public.occasions(id) ON DELETE CASCADE,
    PRIMARY KEY (product_id, occasion_id)
);

-- ------------------------------------------------------------------------------
-- 6. DATA BACKFILL FOR EXISTING PRODUCTS
-- ------------------------------------------------------------------------------
-- Backfill frame_shape_id by matching legacy frame_shape text with taxonomy
UPDATE public.products p
SET frame_shape_id = s.id
FROM public.frame_shapes s
WHERE p.frame_shape_id IS NULL
  AND LOWER(TRIM(p.frame_shape)) = LOWER(TRIM(s.name));

-- Fallback for common shape variants like "Square / Rounded" or "Round Oversized"
UPDATE public.products SET frame_shape_id = 'shape-round' WHERE frame_shape_id IS NULL AND LOWER(frame_shape) LIKE '%round%';
UPDATE public.products SET frame_shape_id = 'shape-square' WHERE frame_shape_id IS NULL AND LOWER(frame_shape) LIKE '%square%';
UPDATE public.products SET frame_shape_id = 'shape-shield-wrap' WHERE frame_shape_id IS NULL AND LOWER(frame_shape) LIKE '%shield%';
UPDATE public.products SET frame_shape_id = 'shape-hexagonal' WHERE frame_shape_id IS NULL AND LOWER(frame_shape) LIKE '%hexagonal%';

-- Backfill default variant for any existing products that lack variants
INSERT INTO public.product_variants (
    id, product_id, color_name, color_hex, sku, price, stock_status, shopee_url, is_active, is_default, sort_order
)
SELECT 
    uuid_generate_v4(),
    p.id,
    COALESCE(NULLIF(p.color, ''), 'Classic Monochrome'),
    '#111111',
    p.sku,
    p.price,
    COALESCE(p.stock_status, 'Available'),
    p.shopee_url,
    true,
    true,
    1
FROM public.products p
WHERE NOT EXISTS (
    SELECT 1 FROM public.product_variants v WHERE v.product_id = p.id
);

-- ------------------------------------------------------------------------------
-- 7. ENABLE ROW LEVEL SECURITY & POLICIES
-- ------------------------------------------------------------------------------
ALTER TABLE public.frame_shapes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.face_shapes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.occasions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_face_shapes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_occasions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if re-running
DROP POLICY IF EXISTS "Public can view active frame shapes" ON public.frame_shapes;
DROP POLICY IF EXISTS "Admin full access to frame shapes" ON public.frame_shapes;
DROP POLICY IF EXISTS "Public can view active face shapes" ON public.face_shapes;
DROP POLICY IF EXISTS "Admin full access to face shapes" ON public.face_shapes;
DROP POLICY IF EXISTS "Public can view active occasions" ON public.occasions;
DROP POLICY IF EXISTS "Admin full access to occasions" ON public.occasions;
DROP POLICY IF EXISTS "Public can view active product variants" ON public.product_variants;
DROP POLICY IF EXISTS "Admin full access to product variants" ON public.product_variants;
DROP POLICY IF EXISTS "Public can view product face shapes" ON public.product_face_shapes;
DROP POLICY IF EXISTS "Admin full access to product face shapes" ON public.product_face_shapes;
DROP POLICY IF EXISTS "Public can view product occasions" ON public.product_occasions;
DROP POLICY IF EXISTS "Admin full access to product occasions" ON public.product_occasions;

-- Taxonomy Policies
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

-- Junction Policies
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

-- ------------------------------------------------------------------------------
-- 8. RELOAD POSTGREST SCHEMA CACHE
-- ------------------------------------------------------------------------------
NOTIFY pgrst, 'reload schema';
