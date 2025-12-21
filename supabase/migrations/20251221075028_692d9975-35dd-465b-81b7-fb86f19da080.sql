-- Add RLS policy for rate_limits table
-- This table is used for rate limiting, accessible by edge functions using service role
CREATE POLICY "Service role can manage rate limits"
ON public.rate_limits
FOR ALL
USING (true)
WITH CHECK (true);

-- Migrate any existing data from user_totp_secrets to secure_totp_secrets
-- Note: Users who had 2FA set up will need to reconfigure it since old secrets aren't encrypted
INSERT INTO public.secure_totp_secrets (user_id, encrypted_secret, backup_codes, created_at, updated_at)
SELECT 
  user_id,
  secret as encrypted_secret,
  backup_codes,
  created_at,
  updated_at
FROM public.user_totp_secrets
WHERE NOT EXISTS (
  SELECT 1 FROM public.secure_totp_secrets s WHERE s.user_id = user_totp_secrets.user_id
)
ON CONFLICT (user_id) DO NOTHING;

-- Drop the old user_totp_secrets table
DROP TABLE IF EXISTS public.user_totp_secrets;