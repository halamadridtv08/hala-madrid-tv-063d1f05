-- 1. article_comments: remove redundant admins-table based SELECT policy
DROP POLICY IF EXISTS "Authenticated view approved comments" ON public.article_comments;
DROP POLICY IF EXISTS "Anyone can create comments" ON public.article_comments;

-- 2. poll_votes: enforce one vote per identifier per poll + admin-only tampering
DELETE FROM public.poll_votes a
USING public.poll_votes b
WHERE a.ctid < b.ctid
  AND a.poll_id = b.poll_id
  AND a.user_identifier = b.user_identifier;

CREATE UNIQUE INDEX IF NOT EXISTS poll_votes_poll_user_unique
  ON public.poll_votes (poll_id, user_identifier);

DROP POLICY IF EXISTS "Admins can update poll votes" ON public.poll_votes;
CREATE POLICY "Admins can update poll votes"
  ON public.poll_votes FOR UPDATE TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Admins can delete poll votes" ON public.poll_votes;
CREATE POLICY "Admins can delete poll votes"
  ON public.poll_votes FOR DELETE TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

-- 3. sound_settings: standardize on has_role
DROP POLICY IF EXISTS "Only admins can insert sound settings" ON public.sound_settings;
DROP POLICY IF EXISTS "Only admins can update sound settings" ON public.sound_settings;
DROP POLICY IF EXISTS "Only admins can delete sound settings" ON public.sound_settings;

CREATE POLICY "Only admins can insert sound settings"
  ON public.sound_settings FOR INSERT TO authenticated
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Only admins can update sound settings"
  ON public.sound_settings FOR UPDATE TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Only admins can delete sound settings"
  ON public.sound_settings FOR DELETE TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));