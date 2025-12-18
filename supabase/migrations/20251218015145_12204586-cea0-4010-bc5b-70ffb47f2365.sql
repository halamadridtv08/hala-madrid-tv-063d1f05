-- Add view_count column to articles for trending functionality
ALTER TABLE public.articles ADD COLUMN IF NOT EXISTS view_count integer DEFAULT 0;

-- Create index for efficient sorting by views
CREATE INDEX IF NOT EXISTS idx_articles_view_count ON public.articles(view_count DESC);

-- Create admin_notifications table for comment notifications
CREATE TABLE IF NOT EXISTS public.admin_notifications (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  type text NOT NULL, -- 'comment', 'poll_vote', 'quiz_completion'
  title text NOT NULL,
  message text NOT NULL,
  entity_id uuid, -- article_id, comment_id, etc.
  entity_type text, -- 'article', 'comment', 'poll', 'quiz'
  is_read boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  read_at timestamp with time zone
);

-- Enable RLS on admin_notifications
ALTER TABLE public.admin_notifications ENABLE ROW LEVEL SECURITY;

-- Only admins can view notifications
CREATE POLICY "Admins can view notifications" ON public.admin_notifications
  FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));

-- Only admins can update notifications (mark as read)
CREATE POLICY "Admins can update notifications" ON public.admin_notifications
  FOR UPDATE USING (has_role(auth.uid(), 'admin'::app_role));

-- System can insert notifications (via triggers/functions)
CREATE POLICY "System can insert notifications" ON public.admin_notifications
  FOR INSERT WITH CHECK (true);

-- Admins can delete notifications
CREATE POLICY "Admins can delete notifications" ON public.admin_notifications
  FOR DELETE USING (has_role(auth.uid(), 'admin'::app_role));

-- Create function to notify admin on new comment
CREATE OR REPLACE FUNCTION notify_admin_on_comment()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.admin_notifications (type, title, message, entity_id, entity_type)
  VALUES (
    'comment',
    'Nouveau commentaire',
    'Un nouveau commentaire de ' || NEW.user_name || ' attend votre approbation.',
    NEW.id,
    'comment'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new comments
DROP TRIGGER IF EXISTS on_new_comment ON public.article_comments;
CREATE TRIGGER on_new_comment
  AFTER INSERT ON public.article_comments
  FOR EACH ROW
  EXECUTE FUNCTION notify_admin_on_comment();

-- Update article_comments RLS to allow public to view approved comments
DROP POLICY IF EXISTS "Anyone can view approved comments" ON public.article_comments;
CREATE POLICY "Anyone can view approved comments" ON public.article_comments
  FOR SELECT USING (is_approved = true AND is_published = true);