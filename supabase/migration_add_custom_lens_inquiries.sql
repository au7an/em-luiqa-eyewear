-- ==============================================================================
-- JEM LUIQA — CUSTOM LENS INQUIRIES & PRESCRIPTION UPLOAD MIGRATION
-- ==============================================================================

-- 1. Modify email to be nullable (since phone/WhatsApp is primary)
ALTER TABLE public.inquiries ALTER COLUMN email DROP NOT NULL;

-- 2. Add columns for custom lens structured data
ALTER TABLE public.inquiries ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE public.inquiries ADD COLUMN IF NOT EXISTS product_id TEXT;
ALTER TABLE public.inquiries ADD COLUMN IF NOT EXISTS product_name TEXT;
ALTER TABLE public.inquiries ADD COLUMN IF NOT EXISTS variant_name TEXT;
ALTER TABLE public.inquiries ADD COLUMN IF NOT EXISTS variant_sku TEXT;
ALTER TABLE public.inquiries ADD COLUMN IF NOT EXISTS variant_color_hex TEXT;
ALTER TABLE public.inquiries ADD COLUMN IF NOT EXISTS prescription_file_url TEXT;
ALTER TABLE public.inquiries ADD COLUMN IF NOT EXISTS prescription_file_name TEXT;
ALTER TABLE public.inquiries ADD COLUMN IF NOT EXISTS custom_lens_data JSONB;
ALTER TABLE public.inquiries ADD COLUMN IF NOT EXISTS total_price TEXT;

-- 3. Update status CHECK constraint to support new workflow
ALTER TABLE public.inquiries DROP CONSTRAINT IF EXISTS inquiries_status_check;
ALTER TABLE public.inquiries ADD CONSTRAINT inquiries_status_check 
  CHECK (status IN ('New', 'Contacted', 'In Production', 'Completed', 'Canceled', 'Read', 'Replied', 'Closed'));

-- 4. Set default status to 'New'
ALTER TABLE public.inquiries ALTER COLUMN status SET DEFAULT 'New';

-- 5. Ensure RLS policies allow public/anon inserts and admin management
ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can insert inquiries" ON public.inquiries;
CREATE POLICY "Public can insert inquiries"
  ON public.inquiries FOR INSERT
  TO public
  WITH CHECK (true);

DROP POLICY IF EXISTS "Public and admin can read inquiries" ON public.inquiries;
CREATE POLICY "Public and admin can read inquiries"
  ON public.inquiries FOR SELECT
  TO public
  USING (true);

DROP POLICY IF EXISTS "Admin full control on inquiries" ON public.inquiries;
CREATE POLICY "Admin full control on inquiries"
  ON public.inquiries FOR ALL
  TO public
  USING (true);

-- 6. Indexes for performance
CREATE INDEX IF NOT EXISTS idx_inquiries_created_at ON public.inquiries(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_inquiries_status ON public.inquiries(status);
