-- Create table to track moderator actions for supervision
CREATE TABLE public.moderator_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  moderator_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL CHECK (action_type IN ('article_published', 'flash_news_published', 'comment_approved', 'comment_rejected', 'player_updated', 'match_updated')),
  entity_type TEXT NOT NULL,
  entity_id UUID,
  entity_title TEXT,
  details JSONB DEFAULT '{}'::jsonb,
  notification_sent BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.moderator_actions ENABLE ROW LEVEL SECURITY;

-- Only admins can view moderator actions (for supervision)
CREATE POLICY "Admins can view all moderator actions"
ON public.moderator_actions
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Moderators and admins can insert their own actions
CREATE POLICY "Moderators can insert their own actions"
ON public.moderator_actions
FOR INSERT
TO authenticated
WITH CHECK (
  moderator_id = auth.uid() 
  AND (has_role(auth.uid(), 'moderator'::app_role) OR has_role(auth.uid(), 'admin'::app_role))
);

-- Create index for performance
CREATE INDEX idx_moderator_actions_moderator_id ON public.moderator_actions(moderator_id);
CREATE INDEX idx_moderator_actions_created_at ON public.moderator_actions(created_at DESC);
CREATE INDEX idx_moderator_actions_action_type ON public.moderator_actions(action_type);

-- Function to log moderator action (can be called from triggers or frontend)
CREATE OR REPLACE FUNCTION public.log_moderator_action(
  p_action_type TEXT,
  p_entity_type TEXT,
  p_entity_id UUID DEFAULT NULL,
  p_entity_title TEXT DEFAULT NULL,
  p_details JSONB DEFAULT '{}'::jsonb
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_action_id UUID;
BEGIN
  -- Only moderators and admins can log actions
  IF NOT (has_role(auth.uid(), 'moderator') OR has_role(auth.uid(), 'admin')) THEN
    RAISE EXCEPTION 'Unauthorized: Only moderators and admins can log actions';
  END IF;

  INSERT INTO public.moderator_actions (
    moderator_id, 
    action_type, 
    entity_type, 
    entity_id, 
    entity_title, 
    details
  )
  VALUES (
    auth.uid(), 
    p_action_type, 
    p_entity_type, 
    p_entity_id, 
    p_entity_title, 
    p_details
  )
  RETURNING id INTO v_action_id;

  RETURN v_action_id;
END;
$$;

-- Function to get moderator activity stats
CREATE OR REPLACE FUNCTION public.get_moderator_activity_stats(
  p_days INTEGER DEFAULT 7
)
RETURNS TABLE (
  moderator_id UUID,
  moderator_email TEXT,
  total_actions BIGINT,
  articles_published BIGINT,
  flash_news_published BIGINT,
  comments_moderated BIGINT,
  last_action_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only admins can view stats
  IF NOT has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Access denied: admin role required';
  END IF;

  RETURN QUERY
  SELECT 
    ma.moderator_id,
    au.email::TEXT as moderator_email,
    COUNT(*)::BIGINT as total_actions,
    COUNT(*) FILTER (WHERE ma.action_type = 'article_published')::BIGINT as articles_published,
    COUNT(*) FILTER (WHERE ma.action_type = 'flash_news_published')::BIGINT as flash_news_published,
    COUNT(*) FILTER (WHERE ma.action_type IN ('comment_approved', 'comment_rejected'))::BIGINT as comments_moderated,
    MAX(ma.created_at) as last_action_at
  FROM public.moderator_actions ma
  INNER JOIN auth.users au ON au.id = ma.moderator_id
  WHERE ma.created_at >= now() - (p_days || ' days')::interval
  GROUP BY ma.moderator_id, au.email
  ORDER BY total_actions DESC;
END;
$$;

-- Function to get recent moderator actions
CREATE OR REPLACE FUNCTION public.get_recent_moderator_actions(
  p_limit INTEGER DEFAULT 50,
  p_moderator_id UUID DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  moderator_id UUID,
  moderator_email TEXT,
  action_type TEXT,
  entity_type TEXT,
  entity_id UUID,
  entity_title TEXT,
  details JSONB,
  created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only admins can view actions
  IF NOT has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Access denied: admin role required';
  END IF;

  RETURN QUERY
  SELECT 
    ma.id,
    ma.moderator_id,
    au.email::TEXT as moderator_email,
    ma.action_type,
    ma.entity_type,
    ma.entity_id,
    ma.entity_title,
    ma.details,
    ma.created_at
  FROM public.moderator_actions ma
  INNER JOIN auth.users au ON au.id = ma.moderator_id
  WHERE (p_moderator_id IS NULL OR ma.moderator_id = p_moderator_id)
  ORDER BY ma.created_at DESC
  LIMIT p_limit;
END;
$$;

-- Function to get admin emails for notifications
CREATE OR REPLACE FUNCTION public.get_admin_emails()
RETURNS TEXT[]
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_emails TEXT[];
BEGIN
  SELECT ARRAY_AGG(au.email)
  INTO v_emails
  FROM public.user_roles ur
  INNER JOIN auth.users au ON au.id = ur.user_id
  WHERE ur.role = 'admin';
  
  RETURN COALESCE(v_emails, ARRAY[]::TEXT[]);
END;
$$;