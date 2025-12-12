-- Fix 1: Create a secure view for article comments that excludes emails
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

-- Fix 2: Create a secure view for prediction leaderboard that excludes emails
CREATE OR REPLACE VIEW public.prediction_leaderboard_public AS
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

-- Fix 3: Update RLS policy on article_comments to be more restrictive
-- First drop the existing public policy
DROP POLICY IF EXISTS "Anyone can view approved comments" ON public.article_comments;

-- Create new policy that hides email from non-admin users
-- Admin can see all, public can only see via the view
CREATE POLICY "Admins can view all comments"
ON public.article_comments
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Fix 4: Update RLS policy on prediction_leaderboard
-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Anyone can view leaderboard" ON public.prediction_leaderboard;

-- Create policy that allows viewing via the secure view only
CREATE POLICY "Admins can view full leaderboard"
ON public.prediction_leaderboard
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Users can view their own record
CREATE POLICY "Users can view their own leaderboard entry"
ON public.prediction_leaderboard
FOR SELECT
USING (auth.uid() = user_id);

-- Grant SELECT on the secure views to anon and authenticated roles
GRANT SELECT ON public.article_comments_public TO anon, authenticated;
GRANT SELECT ON public.prediction_leaderboard_public TO anon, authenticated;