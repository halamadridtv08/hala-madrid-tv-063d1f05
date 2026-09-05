-- Reactions
CREATE TABLE public.live_blog_reactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  entry_id UUID NOT NULL REFERENCES public.live_blog_entries(id) ON DELETE CASCADE,
  emoji TEXT NOT NULL,
  user_identifier TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (entry_id, emoji, user_identifier)
);

GRANT ALL ON public.live_blog_reactions TO service_role;
ALTER TABLE public.live_blog_reactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage live blog reactions"
ON public.live_blog_reactions FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'moderator'))
WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'moderator'));

CREATE INDEX idx_live_blog_reactions_entry ON public.live_blog_reactions(entry_id);

-- Comments
CREATE TABLE public.live_blog_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  match_id UUID NOT NULL REFERENCES public.matches(id) ON DELETE CASCADE,
  entry_id UUID REFERENCES public.live_blog_entries(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  display_name TEXT NOT NULL,
  content TEXT NOT NULL,
  is_hidden BOOLEAN NOT NULL DEFAULT false,
  is_pinned BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT ON public.live_blog_comments TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.live_blog_comments TO authenticated;
GRANT ALL ON public.live_blog_comments TO service_role;
ALTER TABLE public.live_blog_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read visible live blog comments"
ON public.live_blog_comments FOR SELECT
USING (is_hidden = false);

CREATE POLICY "Staff can read all live blog comments"
ON public.live_blog_comments FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'moderator'));

CREATE POLICY "Members can post live blog comments"
ON public.live_blog_comments FOR INSERT TO authenticated
WITH CHECK (user_id = auth.uid() AND length(trim(content)) BETWEEN 1 AND 1000);

CREATE POLICY "Members can edit their own live blog comments"
ON public.live_blog_comments FOR UPDATE TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid() AND is_hidden = false AND is_pinned = false);

CREATE POLICY "Members can delete their own live blog comments"
ON public.live_blog_comments FOR DELETE TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Staff can moderate live blog comments"
ON public.live_blog_comments FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'moderator'))
WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'moderator'));

CREATE POLICY "Staff can delete live blog comments"
ON public.live_blog_comments FOR DELETE TO authenticated
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'moderator'));

CREATE INDEX idx_live_blog_comments_match ON public.live_blog_comments(match_id, created_at DESC);

CREATE TRIGGER update_live_blog_comments_updated_at
BEFORE UPDATE ON public.live_blog_comments
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Secure reaction helpers
CREATE OR REPLACE FUNCTION public.toggle_live_blog_reaction(
  p_entry_id UUID,
  p_emoji TEXT,
  p_user_identifier TEXT
) RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_deleted INT;
BEGIN
  IF p_user_identifier IS NULL OR length(trim(p_user_identifier)) < 8 THEN
    RAISE EXCEPTION 'invalid identifier';
  END IF;
  IF p_emoji IS NULL OR length(p_emoji) > 8 THEN
    RAISE EXCEPTION 'invalid emoji';
  END IF;

  DELETE FROM public.live_blog_reactions
  WHERE entry_id = p_entry_id AND emoji = p_emoji AND user_identifier = p_user_identifier;
  GET DIAGNOSTICS v_deleted = ROW_COUNT;

  IF v_deleted > 0 THEN
    RETURN false;
  END IF;

  INSERT INTO public.live_blog_reactions (entry_id, emoji, user_identifier)
  VALUES (p_entry_id, p_emoji, p_user_identifier)
  ON CONFLICT DO NOTHING;

  RETURN true;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_live_blog_reactions(
  p_match_id UUID,
  p_user_identifier TEXT DEFAULT NULL
) RETURNS TABLE(entry_id UUID, emoji TEXT, total BIGINT, reacted BOOLEAN)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT r.entry_id,
         r.emoji,
         count(*)::bigint AS total,
         bool_or(r.user_identifier = p_user_identifier) AS reacted
  FROM public.live_blog_reactions r
  JOIN public.live_blog_entries e ON e.id = r.entry_id
  WHERE e.match_id = p_match_id
  GROUP BY r.entry_id, r.emoji;
$$;

REVOKE ALL ON FUNCTION public.toggle_live_blog_reaction(UUID, TEXT, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.toggle_live_blog_reaction(UUID, TEXT, TEXT) TO anon, authenticated;
REVOKE ALL ON FUNCTION public.get_live_blog_reactions(UUID, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_live_blog_reactions(UUID, TEXT) TO anon, authenticated;

ALTER PUBLICATION supabase_realtime ADD TABLE public.live_blog_reactions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.live_blog_comments;