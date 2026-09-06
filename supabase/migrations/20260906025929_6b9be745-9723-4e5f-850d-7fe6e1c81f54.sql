-- 1. Replies on live blog comments
ALTER TABLE public.live_blog_comments
  ADD COLUMN IF NOT EXISTS parent_id uuid REFERENCES public.live_blog_comments(id) ON DELETE CASCADE;

-- 2. Reports
CREATE TABLE public.live_blog_comment_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  comment_id uuid NOT NULL REFERENCES public.live_blog_comments(id) ON DELETE CASCADE,
  reporter_user_id uuid,
  reporter_identifier text,
  reason text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  handled_by uuid,
  handled_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT INSERT ON public.live_blog_comment_reports TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.live_blog_comment_reports TO authenticated;
GRANT ALL ON public.live_blog_comment_reports TO service_role;

ALTER TABLE public.live_blog_comment_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can report a comment"
  ON public.live_blog_comment_reports FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    length(reason) BETWEEN 3 AND 500
    AND status = 'pending'
    AND (reporter_user_id IS NULL OR reporter_user_id = auth.uid())
  );

CREATE POLICY "Staff can view reports"
  ON public.live_blog_comment_reports FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'moderator'));

CREATE POLICY "Staff can update reports"
  ON public.live_blog_comment_reports FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'moderator'))
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'moderator'));

CREATE POLICY "Admins can delete reports"
  ON public.live_blog_comment_reports FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_live_blog_comment_reports_updated_at
  BEFORE UPDATE ON public.live_blog_comment_reports
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 3. Moderation audit log
CREATE TABLE public.live_blog_moderation_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  moderator_id uuid NOT NULL DEFAULT auth.uid(),
  moderator_email text,
  comment_id uuid,
  match_id uuid,
  action text NOT NULL,
  details jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT ON public.live_blog_moderation_logs TO authenticated;
GRANT ALL ON public.live_blog_moderation_logs TO service_role;

ALTER TABLE public.live_blog_moderation_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can view moderation logs"
  ON public.live_blog_moderation_logs FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'moderator'));

CREATE POLICY "Staff can insert their own moderation logs"
  ON public.live_blog_moderation_logs FOR INSERT
  TO authenticated
  WITH CHECK (
    moderator_id = auth.uid()
    AND (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'moderator'))
  );

-- 4. User notifications
CREATE TABLE public.user_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  type text NOT NULL,
  title text NOT NULL,
  message text,
  link text,
  entity_type text,
  entity_id uuid,
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, UPDATE, DELETE ON public.user_notifications TO authenticated;
GRANT ALL ON public.user_notifications TO service_role;

ALTER TABLE public.user_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view their notifications"
  ON public.user_notifications FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users update their notifications"
  ON public.user_notifications FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users delete their notifications"
  ON public.user_notifications FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

CREATE INDEX idx_user_notifications_user ON public.user_notifications(user_id, is_read, created_at DESC);

-- 5. Triggers
CREATE OR REPLACE FUNCTION public.notify_on_live_blog_comment()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_parent_user uuid;
BEGIN
  INSERT INTO public.admin_notifications (type, title, message, entity_id, entity_type)
  VALUES (
    'live_blog_comment',
    'Nouveau commentaire live blog',
    NEW.display_name || ' : ' || left(NEW.content, 120),
    NEW.id,
    'live_blog_comment'
  );

  IF NEW.parent_id IS NOT NULL THEN
    SELECT user_id INTO v_parent_user FROM public.live_blog_comments WHERE id = NEW.parent_id;
    IF v_parent_user IS NOT NULL AND v_parent_user <> NEW.user_id THEN
      INSERT INTO public.user_notifications (user_id, type, title, message, link, entity_type, entity_id)
      VALUES (
        v_parent_user,
        'comment_reply',
        'Réponse à votre commentaire',
        NEW.display_name || ' a répondu : ' || left(NEW.content, 120),
        '/live-blog/' || NEW.match_id::text,
        'live_blog_comment',
        NEW.id
      );
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_notify_on_live_blog_comment
  AFTER INSERT ON public.live_blog_comments
  FOR EACH ROW EXECUTE FUNCTION public.notify_on_live_blog_comment();

CREATE OR REPLACE FUNCTION public.notify_admin_on_poll_vote()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.admin_notifications (type, title, message, entity_id, entity_type)
  VALUES (
    'poll_vote',
    'Nouveau vote au sondage',
    'Un visiteur vient de voter à un sondage.',
    NEW.poll_id,
    'poll'
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_notify_admin_on_poll_vote
  AFTER INSERT ON public.poll_votes
  FOR EACH ROW EXECUTE FUNCTION public.notify_admin_on_poll_vote();

CREATE OR REPLACE FUNCTION public.notify_admin_on_comment_report()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.admin_notifications (type, title, message, entity_id, entity_type)
  VALUES (
    'comment_report',
    'Commentaire signalé',
    'Motif : ' || left(NEW.reason, 150),
    NEW.id,
    'live_blog_comment_report'
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_notify_admin_on_comment_report
  AFTER INSERT ON public.live_blog_comment_reports
  FOR EACH ROW EXECUTE FUNCTION public.notify_admin_on_comment_report();

-- 6. Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.live_blog_comment_reports;
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE public.live_blog_moderation_logs;