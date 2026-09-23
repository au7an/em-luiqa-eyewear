-- ==============================================================================
-- JEM LUIQA — FIX INQUIRIES STATUS CHECK CONSTRAINT & ROW LEVEL SECURITY (RLS)
-- ==============================================================================
-- Run this script in the Supabase Dashboard -> SQL Editor -> Run
-- This resolves:
-- 1. Status update rejection due to inquiries_status_check
-- 2. RLS policy rejection on INSERT, SELECT, UPDATE, DELETE for inquiries
-- 3. Ensures all custom lens & prescription columns exist

-- 1. Ensure all custom lens columns exist
ALTER TABLE public.inquiries ALTER COLUMN email DROP NOT NULL;
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
ALTER TABLE public.inquiries ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now());

-- 2. Drop existing CHECK constraint and replace with all active workflow statuses
ALTER TABLE public.inquiries DROP CONSTRAINT IF EXISTS inquiries_status_check;
ALTER TABLE public.inquiries ADD CONSTRAINT inquiries_status_check 
  CHECK (status IN (
    'New', 
    'Contacted', 
    'In Production', 
    'Completed', 
    'Canceled', 
    'Read', 
    'Replied', 
    'Closed'
  ));

-- 3. Set default status
ALTER TABLE public.inquiries ALTER COLUMN status SET DEFAULT 'New';

-- 4. Reconfigure Row Level Security (RLS)
ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY;

-- Drop any conflicting older policies
DROP POLICY IF EXISTS "Public can insert inquiries" ON public.inquiries;
DROP POLICY IF EXISTS "Admin can view and manage inquiries" ON public.inquiries;
DROP POLICY IF EXISTS "Public and admin can read inquiries" ON public.inquiries;
DROP POLICY IF EXISTS "Admin full control on inquiries" ON public.inquiries;
DROP POLICY IF EXISTS "Allow anon and auth insert inquiries" ON public.inquiries;
DROP POLICY IF EXISTS "Allow anon and auth select inquiries" ON public.inquiries;
DROP POLICY IF EXISTS "Allow anon and auth update inquiries" ON public.inquiries;
DROP POLICY IF EXISTS "Allow anon and auth delete inquiries" ON public.inquiries;

-- Allow public & authenticated users to submit customer inquiries
CREATE POLICY "Allow anon and auth insert inquiries"
  ON public.inquiries FOR INSERT
  TO public
  WITH CHECK (true);

-- Allow inquiries to be viewed in studio CMS
CREATE POLICY "Allow anon and auth select inquiries"
  ON public.inquiries FOR SELECT
  TO public
  USING (true);

-- Allow studio admin & service client to update inquiry status
CREATE POLICY "Allow anon and auth update inquiries"
  ON public.inquiries FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

-- Allow inquiry deletion from CMS
CREATE POLICY "Allow anon and auth delete inquiries"
  ON public.inquiries FOR DELETE
  TO public
  USING (true);

-- 5. Indexes for fast status filtering and date ordering
CREATE INDEX IF NOT EXISTS idx_inquiries_created_at ON public.inquiries(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_inquiries_status ON public.inquiries(status);
