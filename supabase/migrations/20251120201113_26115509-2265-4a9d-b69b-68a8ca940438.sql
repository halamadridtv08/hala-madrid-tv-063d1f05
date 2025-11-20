-- Fix security definer view by dropping and recreating without security definer
DROP VIEW IF EXISTS public.published_flash_news;

-- The view doesn't need to be security definer, it just filters published content
CREATE VIEW public.published_flash_news AS
SELECT *
FROM public.flash_news
WHERE is_published = true
ORDER BY created_at DESC;