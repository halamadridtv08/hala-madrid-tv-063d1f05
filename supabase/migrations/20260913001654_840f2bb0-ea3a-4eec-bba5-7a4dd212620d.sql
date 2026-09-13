ALTER TABLE public.story_display_settings
  ADD COLUMN IF NOT EXISTS show_floating_rail boolean NOT NULL DEFAULT true;

CREATE TABLE public.blocked_comment_words (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  word text NOT NULL,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.blocked_comment_words TO authenticated;
GRANT ALL ON public.blocked_comment_words TO service_role;
ALTER TABLE public.blocked_comment_words ENABLE ROW LEVEL SECURITY;
CREATE UNIQUE INDEX blocked_comment_words_word_unique_idx ON public.blocked_comment_words (lower(btrim(word)));
CREATE POLICY "Admins and moderators manage blocked comment words"
ON public.blocked_comment_words
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'moderator'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'moderator'::public.app_role));

ALTER TABLE public.article_comments
  ADD COLUMN IF NOT EXISTS is_flagged boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS flagged_reason text;
ALTER TABLE public.article_comments ALTER COLUMN is_approved SET DEFAULT true;
UPDATE public.article_comments SET is_approved = true WHERE is_approved = false;

CREATE INDEX IF NOT EXISTS article_comments_article_status_idx
ON public.article_comments (article_id, is_published, is_flagged, created_at DESC);

CREATE OR REPLACE FUNCTION public.submit_article_comment(
  p_article_id uuid,
  p_user_name text,
  p_user_email text,
  p_content text
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_comment_id uuid;
  v_matched_words text;
BEGIN
  IF length(btrim(p_user_name)) < 2 OR length(btrim(p_user_name)) > 100 THEN
    RAISE EXCEPTION 'Invalid user name length';
  END IF;
  IF length(btrim(p_content)) < 5 OR length(btrim(p_content)) > 5000 THEN
    RAISE EXCEPTION 'Invalid content length';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.articles a WHERE a.id = p_article_id AND a.is_published = true) THEN
    RAISE EXCEPTION 'Article unavailable';
  END IF;

  SELECT string_agg(btrim(w.word), ', ' ORDER BY btrim(w.word))
    INTO v_matched_words
  FROM public.blocked_comment_words w
  WHERE lower(p_content) ~ ('(^|[^[:alnum:]_])' || regexp_replace(lower(btrim(w.word)), '([\\.\\+\\*\\?\\[\\^\\]\\$\\(\\)\\{\\}=!<>|:\\-])', '\\\1', 'g') || '([^[:alnum:]_]|$)');

  INSERT INTO public.article_comments (
    article_id, user_name, content, is_approved, is_published, is_flagged, flagged_reason
  ) VALUES (
    p_article_id,
    btrim(p_user_name),
    btrim(p_content),
    true,
    v_matched_words IS NULL,
    v_matched_words IS NOT NULL,
    v_matched_words
  )
  RETURNING id INTO v_comment_id;

  IF p_user_email IS NOT NULL AND btrim(p_user_email) <> '' THEN
    IF p_user_email !~ '^[a-zA-Z0-9.!#$%&''*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$' THEN
      RAISE EXCEPTION 'Invalid email format';
    END IF;
    INSERT INTO public.article_comment_emails (comment_id, user_email)
    VALUES (v_comment_id, btrim(p_user_email));
  END IF;

  RETURN v_comment_id;
END;
$$;

DROP VIEW IF EXISTS public.article_comments_public;
CREATE VIEW public.article_comments_public
AS
SELECT id, article_id, user_name, content, is_approved, is_published, created_at, updated_at
FROM public.article_comments
WHERE is_approved = true AND is_published = true AND is_flagged = false;
GRANT SELECT ON public.article_comments_public TO anon, authenticated;

DROP FUNCTION IF EXISTS public.get_article_comments_with_emails(uuid);
CREATE FUNCTION public.get_article_comments_with_emails(p_article_id uuid)
RETURNS TABLE(
  id uuid,
  article_id uuid,
  user_name text,
  user_email text,
  content text,
  is_approved boolean,
  is_published boolean,
  is_flagged boolean,
  flagged_reason text,
  created_at timestamptz,
  updated_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NOT (public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'moderator'::public.app_role)) THEN
    RAISE EXCEPTION 'Access denied';
  END IF;
  RETURN QUERY
  SELECT c.id, c.article_id, c.user_name, e.user_email, c.content,
         c.is_approved, c.is_published, c.is_flagged, c.flagged_reason,
         c.created_at, c.updated_at
  FROM public.article_comments c
  LEFT JOIN public.article_comment_emails e ON e.comment_id = c.id
  WHERE c.article_id = p_article_id
  ORDER BY c.created_at DESC;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_article_comment_counts()
RETURNS TABLE(article_id uuid, total bigint, hidden bigint)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT c.article_id,
         count(*)::bigint AS total,
         count(*) FILTER (WHERE c.is_flagged OR NOT c.is_published)::bigint AS hidden
  FROM public.article_comments c
  WHERE public.has_role(auth.uid(), 'admin'::public.app_role)
     OR public.has_role(auth.uid(), 'moderator'::public.app_role)
  GROUP BY c.article_id;
$$;
GRANT EXECUTE ON FUNCTION public.get_article_comment_counts() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_article_comment_counts() TO service_role;

CREATE OR REPLACE FUNCTION public.notify_admin_on_comment()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.admin_notifications (type, title, message, entity_id, entity_type)
  VALUES (
    'comment',
    CASE WHEN NEW.is_flagged THEN 'Commentaire masqué automatiquement' ELSE 'Nouveau commentaire publié' END,
    CASE WHEN NEW.is_flagged
      THEN 'Le commentaire de ' || NEW.user_name || ' contient un mot bloqué et a été masqué.'
      ELSE NEW.user_name || ' a commenté un article.'
    END,
    NEW.id,
    'comment'
  );
  RETURN NEW;
END;
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'admin_notifications'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.admin_notifications;
  END IF;
END $$;
ALTER TABLE public.admin_notifications REPLICA IDENTITY FULL;
ALTER TABLE public.user_notifications REPLICA IDENTITY FULL;

CREATE OR REPLACE FUNCTION public.enforce_story_expiration()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
DECLARE
  v_start timestamptz;
BEGIN
  IF NEW.is_highlight THEN
    RETURN NEW;
  END IF;
  IF TG_OP = 'INSERT' THEN
    v_start := COALESCE(NEW.scheduled_at, NEW.created_at, now());
    NEW.expires_at := COALESCE(NEW.expires_at, v_start + interval '24 hours');
  ELSIF OLD.expires_at IS NOT NULL THEN
    NEW.expires_at := OLD.expires_at;
  ELSE
    v_start := COALESCE(NEW.scheduled_at, OLD.scheduled_at, OLD.created_at, NEW.created_at, now());
    NEW.expires_at := v_start + interval '24 hours';
  END IF;
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS enforce_story_expiration_trigger ON public.story_rings;
CREATE TRIGGER enforce_story_expiration_trigger
BEFORE INSERT OR UPDATE ON public.story_rings
FOR EACH ROW EXECUTE FUNCTION public.enforce_story_expiration();