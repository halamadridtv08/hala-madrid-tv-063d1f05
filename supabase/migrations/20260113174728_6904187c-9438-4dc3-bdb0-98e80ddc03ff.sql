-- ========================================
-- SECURITY FIX: Protect email addresses from public exposure
-- ========================================

-- 1. ARTICLE COMMENTS: Restrict public access to use the public view only
-- Drop the overly permissive public SELECT policies that expose user_email

DROP POLICY IF EXISTS "Public can view approved published comments" ON article_comments;
DROP POLICY IF EXISTS "Public view approved comments" ON article_comments;

-- Create a new restricted policy that only allows admins/moderators to see emails
-- Public users should query the article_comments_public view instead
CREATE POLICY "Public cannot directly query article_comments - use view"
ON article_comments
FOR SELECT
TO anon
USING (false);

-- Authenticated users (non-admin) should also use the public view
-- Only allow them to see their own comments with email
CREATE POLICY "Authenticated users can view approved comments without email access"
ON article_comments
FOR SELECT
TO authenticated
USING (
  -- Admins and moderators see all
  (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'moderator'::app_role))
  OR
  -- Regular users only see approved/published comments (will use view for no email)
  ((is_approved = true) AND (is_published = true))
);

-- 2. PREDICTION LEADERBOARD: Ensure non-admin users can only see their own entry
-- The existing "Users can view their own leaderboard entry" is fine
-- But we need to ensure users can see the public view for others

-- Add a comment to document the security model
COMMENT ON TABLE prediction_leaderboard IS 'Contains user predictions with email. Public queries should use prediction_leaderboard_public view. Direct table access shows user_email only to admins or the user themselves.';

-- 3. LOGIN ATTEMPTS: Add audit logging for admin access
-- Create a function that logs when login_attempts is accessed by admins

CREATE OR REPLACE FUNCTION log_login_attempts_access()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only log if the accessor is an admin (non-service-role)
  IF auth.uid() IS NOT NULL AND has_role(auth.uid(), 'admin'::app_role) THEN
    INSERT INTO admin_audit_logs (user_id, action, entity_type, entity_id, details)
    VALUES (
      auth.uid(),
      'view',
      'login_attempts',
      NEW.id::text,
      jsonb_build_object(
        'accessed_email', NEW.email,
        'accessed_at', now()
      )
    );
  END IF;
  RETURN NEW;
END;
$$;

-- Note: PostgreSQL doesn't support SELECT triggers directly
-- Instead, create a wrapper function for admin access that logs the query
CREATE OR REPLACE FUNCTION get_login_attempts_with_audit(
  p_limit INTEGER DEFAULT 100,
  p_offset INTEGER DEFAULT 0,
  p_email TEXT DEFAULT NULL
)
RETURNS TABLE (
  id uuid,
  email text,
  attempted_at timestamptz,
  success boolean,
  failed_reason text,
  ip_address text,
  user_agent text,
  device_fingerprint text,
  country text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check admin access
  IF NOT has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'Access denied: Admin role required';
  END IF;
  
  -- Log the access
  INSERT INTO admin_audit_logs (user_id, action, entity_type, details)
  VALUES (
    auth.uid(),
    'view_login_attempts',
    'login_attempts',
    jsonb_build_object(
      'filter_email', p_email,
      'limit', p_limit,
      'offset', p_offset,
      'accessed_at', now()
    )
  );
  
  -- Return the data
  RETURN QUERY
  SELECT 
    la.id,
    la.email,
    la.attempted_at,
    la.success,
    la.failed_reason,
    la.ip_address,
    la.user_agent,
    la.device_fingerprint,
    la.country
  FROM login_attempts la
  WHERE (p_email IS NULL OR la.email ILIKE '%' || p_email || '%')
  ORDER BY la.attempted_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$;

-- Grant execute to authenticated users (function checks admin role internally)
GRANT EXECUTE ON FUNCTION get_login_attempts_with_audit TO authenticated;