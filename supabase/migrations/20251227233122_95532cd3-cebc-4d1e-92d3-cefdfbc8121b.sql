-- Add RLS policy for rate_limits table
-- This table should only be accessed by service role and SECURITY DEFINER functions
-- Regular users should never have direct access

-- Policy for service role to manage rate limits (for maintenance/cleanup)
CREATE POLICY "Service role full access to rate_limits"
ON public.rate_limits
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Note: Regular authenticated users cannot access this table directly
-- Access is only through SECURITY DEFINER functions like check_rate_limit() and cleanup_rate_limits()