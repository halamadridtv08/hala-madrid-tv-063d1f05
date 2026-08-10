
-- 1. dream_teams
DROP POLICY IF EXISTS "Anyone can view shared dream teams" ON public.dream_teams;

CREATE POLICY "Owners and admins can view dream teams"
ON public.dream_teams FOR SELECT
USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

CREATE OR REPLACE FUNCTION public.get_dream_team_by_token(p_share_token text)
RETURNS SETOF public.dream_teams
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT * FROM public.dream_teams
  WHERE share_token IS NOT NULL
    AND p_share_token IS NOT NULL
    AND length(p_share_token) >= 16
    AND share_token = p_share_token
  LIMIT 1;
$$;

GRANT EXECUTE ON FUNCTION public.get_dream_team_by_token(text) TO anon, authenticated;

-- 2. match_predictions
DROP POLICY IF EXISTS "Users can view all predictions for finished matches" ON public.match_predictions;

CREATE POLICY "Authenticated users can view predictions for finished matches"
ON public.match_predictions FOR SELECT
TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.matches
  WHERE matches.id = match_predictions.match_id
    AND matches.status = 'finished'
));

-- 3. poll_votes
DROP POLICY IF EXISTS "Anyone can view poll votes" ON public.poll_votes;

CREATE POLICY "Admins can view poll votes"
ON public.poll_votes FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE OR REPLACE FUNCTION public.has_voted_in_poll(p_poll_id uuid, p_user_identifier text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.poll_votes
    WHERE poll_id = p_poll_id
      AND user_identifier = p_user_identifier
  );
$$;

GRANT EXECUTE ON FUNCTION public.has_voted_in_poll(uuid, text) TO anon, authenticated;
