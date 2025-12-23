-- Drop and recreate the view with SECURITY INVOKER (the default and safer option)
DROP VIEW IF EXISTS public.article_comments_public;

CREATE VIEW public.article_comments_public 
WITH (security_invoker = true) AS
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