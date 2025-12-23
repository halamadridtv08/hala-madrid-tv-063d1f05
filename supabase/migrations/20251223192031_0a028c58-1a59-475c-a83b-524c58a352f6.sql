-- Revoke direct SELECT access to article_comments for anonymous and authenticated users
-- This prevents email harvesting through direct database queries
REVOKE SELECT ON public.article_comments FROM anon;

-- Grant SELECT access to the public view (which excludes user_email)
GRANT SELECT ON public.article_comments_public TO anon, authenticated;

-- Keep authenticated users able to INSERT comments
-- (RLS policy already handles INSERT: "Users can submit comments")

-- Update the public view to ensure it's properly defined without user_email
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