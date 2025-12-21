-- Fix the Security Definer View issue - recreate as regular view with SECURITY INVOKER
DROP VIEW IF EXISTS public.article_comments_public;

-- Recreate view with SECURITY INVOKER (default, respects querying user's permissions)
CREATE VIEW public.article_comments_public 
WITH (security_invoker = true)
AS
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