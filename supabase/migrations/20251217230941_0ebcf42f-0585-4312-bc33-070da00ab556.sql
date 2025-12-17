-- Drop existing policies on prediction_leaderboard if they exist
DROP POLICY IF EXISTS "Users can view their own leaderboard entry" ON public.prediction_leaderboard;
DROP POLICY IF EXISTS "Only admins can view full leaderboard with emails" ON public.prediction_leaderboard;
DROP POLICY IF EXISTS "Only admins can manage leaderboard" ON public.prediction_leaderboard;

-- Enable RLS on prediction_leaderboard table
ALTER TABLE public.prediction_leaderboard ENABLE ROW LEVEL SECURITY;

-- Only admins can view the full table with emails
CREATE POLICY "Only admins can view full leaderboard with emails"
ON public.prediction_leaderboard FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Users can view their own entry only
CREATE POLICY "Users can view their own leaderboard entry"
ON public.prediction_leaderboard FOR SELECT
USING (auth.uid() = user_id);

-- Only system/admins can insert/update/delete
CREATE POLICY "Only admins can manage leaderboard"
ON public.prediction_leaderboard FOR ALL
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Create SECURITY DEFINER function for login attempt logging
CREATE OR REPLACE FUNCTION public.log_login_attempt(
  p_email TEXT,
  p_success BOOLEAN,
  p_ip_address TEXT DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO login_attempts (email, success, ip_address, user_agent)
  VALUES (p_email, p_success, p_ip_address, p_user_agent);
END;
$$;

-- Grant execute to both anonymous and authenticated users
GRANT EXECUTE ON FUNCTION public.log_login_attempt TO anon, authenticated;