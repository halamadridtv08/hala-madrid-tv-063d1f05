-- Fix the SECURITY DEFINER issue by using SECURITY INVOKER (default, but explicit)
DROP VIEW IF EXISTS public.article_comments_public;
DROP VIEW IF EXISTS public.prediction_leaderboard_public;

-- Recreate views with explicit SECURITY INVOKER
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

CREATE VIEW public.prediction_leaderboard_public 
WITH (security_invoker = true)
AS
SELECT 
  id,
  user_id,
  total_points,
  correct_scores,
  correct_outcomes,
  total_predictions,
  current_streak,
  best_streak,
  created_at,
  updated_at
FROM public.prediction_leaderboard;

-- Re-grant SELECT on the secure views
GRANT SELECT ON public.article_comments_public TO anon, authenticated;
GRANT SELECT ON public.prediction_leaderboard_public TO anon, authenticated;