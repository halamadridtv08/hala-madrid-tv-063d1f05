-- Create or replace function to check if user is blocked
CREATE OR REPLACE FUNCTION public.check_login_blocked(p_email TEXT, p_ip_address TEXT DEFAULT NULL)
RETURNS TABLE(is_blocked BOOLEAN, blocked_until TIMESTAMPTZ, failed_attempts INT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_failed_count INT;
  v_last_attempt TIMESTAMPTZ;
  v_block_duration INTERVAL := '15 minutes';
  v_max_attempts INT := 5;
BEGIN
  -- Count failed attempts in the last 15 minutes
  SELECT COUNT(*), MAX(attempted_at)
  INTO v_failed_count, v_last_attempt
  FROM public.login_attempts
  WHERE (email = p_email OR (p_ip_address IS NOT NULL AND ip_address = p_ip_address))
    AND success = false
    AND attempted_at > NOW() - v_block_duration;

  -- Check if blocked
  IF v_failed_count >= v_max_attempts THEN
    RETURN QUERY SELECT 
      true AS is_blocked,
      v_last_attempt + v_block_duration AS blocked_until,
      v_failed_count AS failed_attempts;
  ELSE
    RETURN QUERY SELECT 
      false AS is_blocked,
      NULL::TIMESTAMPTZ AS blocked_until,
      v_failed_count AS failed_attempts;
  END IF;
END;
$$;

-- Grant execute permission to authenticated and anon users
GRANT EXECUTE ON FUNCTION public.check_login_blocked(TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.check_login_blocked(TEXT, TEXT) TO anon;