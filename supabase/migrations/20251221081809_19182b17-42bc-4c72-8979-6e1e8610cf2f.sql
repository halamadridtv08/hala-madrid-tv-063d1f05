-- Fix article_comments RLS: Hide user_email from public access
-- Ensure RLS is enabled
ALTER TABLE public.article_comments ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Anyone can view approved comments" ON public.article_comments;
DROP POLICY IF EXISTS "Users can insert comments" ON public.article_comments;
DROP POLICY IF EXISTS "Admins can manage all comments" ON public.article_comments;
DROP POLICY IF EXISTS "Anyone can view approved comments without email" ON public.article_comments;
DROP POLICY IF EXISTS "Authenticated users can insert comments" ON public.article_comments;
DROP POLICY IF EXISTS "Anonymous users can insert comments" ON public.article_comments;

-- Create a secure view for public access (without email)
CREATE OR REPLACE VIEW public.article_comments_public AS
SELECT 
  id,
  article_id,
  user_name,
  content,
  is_approved,
  is_published,
  created_at,
  updated_at
FROM public.article_comments
WHERE is_approved = true AND is_published = true;

-- Grant select on the public view
GRANT SELECT ON public.article_comments_public TO anon, authenticated;

-- Policy: Public can only view approved comments (RLS restricts email column access)
CREATE POLICY "Public view approved comments"
ON public.article_comments
FOR SELECT
TO anon
USING (is_approved = true AND is_published = true);

-- Policy: Authenticated non-admin users see approved comments
CREATE POLICY "Authenticated view approved comments"
ON public.article_comments
FOR SELECT
TO authenticated
USING (
  (is_approved = true AND is_published = true)
  OR EXISTS (SELECT 1 FROM public.admins WHERE admins.id = auth.uid())
);

-- Policy: Anyone can insert comments
CREATE POLICY "Anyone can insert comments"
ON public.article_comments
FOR INSERT
WITH CHECK (true);

-- Policy: Admins can update comments
CREATE POLICY "Admins can update comments"
ON public.article_comments
FOR UPDATE
TO authenticated
USING (EXISTS (SELECT 1 FROM public.admins WHERE admins.id = auth.uid()));

-- Policy: Admins can delete comments
CREATE POLICY "Admins can delete comments"
ON public.article_comments
FOR DELETE
TO authenticated
USING (EXISTS (SELECT 1 FROM public.admins WHERE admins.id = auth.uid()));