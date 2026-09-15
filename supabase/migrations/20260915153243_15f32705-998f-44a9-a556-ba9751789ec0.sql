-- 1) Security definer view -> invoker, with safe column-level access for visitors
ALTER VIEW public.article_comments_public SET (security_invoker = on);

DROP POLICY IF EXISTS "Public cannot directly query article_comments - use view" ON public.article_comments;

CREATE POLICY "Anon can read published comments"
ON public.article_comments
FOR SELECT
TO anon
USING (is_approved = true AND is_published = true AND is_flagged = false);

REVOKE ALL ON public.article_comments FROM anon;
GRANT SELECT (id, article_id, user_name, content, is_approved, is_published, created_at, updated_at)
ON public.article_comments TO anon;
GRANT SELECT ON public.article_comments_public TO anon, authenticated;

-- 2) Prevent users from writing their own points_earned
CREATE OR REPLACE FUNCTION public.protect_prediction_points()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT (public.has_role(auth.uid(), 'admin'::app_role) OR auth.role() = 'service_role') THEN
    NEW.points_earned := COALESCE(OLD.points_earned, 0);
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS protect_prediction_points_trg ON public.match_predictions;
CREATE TRIGGER protect_prediction_points_trg
BEFORE UPDATE ON public.match_predictions
FOR EACH ROW EXECUTE FUNCTION public.protect_prediction_points();

DROP POLICY IF EXISTS "Users can update their own predictions before match starts" ON public.match_predictions;
CREATE POLICY "Users can update their own predictions before match starts"
ON public.match_predictions
FOR UPDATE
TO authenticated
USING (
  auth.uid() = user_id
  AND EXISTS (SELECT 1 FROM public.matches m WHERE m.id = match_predictions.match_id AND m.status = 'upcoming')
)
WITH CHECK (
  auth.uid() = user_id
  AND EXISTS (SELECT 1 FROM public.matches m WHERE m.id = match_predictions.match_id AND m.status = 'upcoming')
);

-- 3) Bind poll votes of logged-in users to their account
DROP POLICY IF EXISTS "Anyone can vote once per poll" ON public.poll_votes;

CREATE POLICY "Authenticated users vote with their own identity"
ON public.poll_votes
FOR INSERT
TO authenticated
WITH CHECK (user_identifier = auth.uid()::text);

CREATE POLICY "Anonymous visitors can vote once per poll"
ON public.poll_votes
FOR INSERT
TO anon
WITH CHECK (
  user_identifier ~ '^[0-9a-fA-F-]{36}$'
  AND NOT EXISTS (SELECT 1 FROM auth.users u WHERE u.id::text = poll_votes.user_identifier)
);