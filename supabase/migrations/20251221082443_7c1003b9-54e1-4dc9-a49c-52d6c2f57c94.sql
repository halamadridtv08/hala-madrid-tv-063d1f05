-- Drop existing policies on article_comments that reference the admins table
DROP POLICY IF EXISTS "Admins can update comments" ON public.article_comments;
DROP POLICY IF EXISTS "Admins can delete comments" ON public.article_comments;
DROP POLICY IF EXISTS "Users can view approved comments" ON public.article_comments;
DROP POLICY IF EXISTS "Anyone can insert comments" ON public.article_comments;
DROP POLICY IF EXISTS "Public can view approved comments" ON public.article_comments;

-- Create harmonized policies using only has_role()
CREATE POLICY "Public can view approved published comments"
ON public.article_comments
FOR SELECT
USING (is_approved = true AND is_published = true);

CREATE POLICY "Anyone can insert comments"
ON public.article_comments
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Admins can update comments via has_role"
ON public.article_comments
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete comments via has_role"
ON public.article_comments
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Create admin_audit_logs table for comprehensive audit logging
CREATE TABLE IF NOT EXISTS public.admin_audit_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT,
  details JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on audit logs (only admins can read, system can write)
ALTER TABLE public.admin_audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view audit logs"
ON public.admin_audit_logs
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Service role can insert audit logs"
ON public.admin_audit_logs
FOR INSERT
WITH CHECK (true);

-- Add device fingerprint column to login_attempts if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'login_attempts' 
    AND column_name = 'device_fingerprint'
  ) THEN
    ALTER TABLE public.login_attempts ADD COLUMN device_fingerprint TEXT;
  END IF;
END $$;

-- Create function to log admin actions
CREATE OR REPLACE FUNCTION public.log_admin_action(
  p_action TEXT,
  p_entity_type TEXT,
  p_entity_id TEXT DEFAULT NULL,
  p_details JSONB DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_log_id UUID;
BEGIN
  -- Only allow admins to log actions
  IF NOT has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Unauthorized: Only admins can log actions';
  END IF;

  INSERT INTO public.admin_audit_logs (user_id, action, entity_type, entity_id, details)
  VALUES (auth.uid(), p_action, p_entity_type, p_entity_id, p_details)
  RETURNING id INTO v_log_id;

  RETURN v_log_id;
END;
$$;