-- ============================================
-- PHASE 1: Chiffrement des secrets TOTP
-- ============================================

-- Enable pgcrypto extension for encryption
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Create secure TOTP secrets table with encryption
CREATE TABLE IF NOT EXISTS public.secure_totp_secrets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  encrypted_secret TEXT NOT NULL,
  backup_codes_encrypted TEXT[] DEFAULT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.secure_totp_secrets ENABLE ROW LEVEL SECURITY;

-- RLS policies - users can only access their own secrets
CREATE POLICY "Users can view their own TOTP secret"
ON public.secure_totp_secrets
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own TOTP secret"
ON public.secure_totp_secrets
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own TOTP secret"
ON public.secure_totp_secrets
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own TOTP secret"
ON public.secure_totp_secrets
FOR DELETE
USING (auth.uid() = user_id);

-- Function to save encrypted TOTP secret (SECURITY DEFINER)
CREATE OR REPLACE FUNCTION public.save_totp_secret(
  p_user_id UUID,
  p_secret TEXT,
  p_encryption_key TEXT
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $function$
DECLARE
  v_encrypted TEXT;
  v_result_id UUID;
BEGIN
  -- Verify user is authenticated and matches
  IF auth.uid() != p_user_id THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;
  
  -- Encrypt the secret
  v_encrypted := encode(pgp_sym_encrypt(p_secret, p_encryption_key), 'base64');
  
  -- Insert or update
  INSERT INTO public.secure_totp_secrets (user_id, encrypted_secret)
  VALUES (p_user_id, v_encrypted)
  ON CONFLICT (user_id) DO UPDATE SET
    encrypted_secret = EXCLUDED.encrypted_secret,
    updated_at = now()
  RETURNING id INTO v_result_id;
  
  RETURN v_result_id;
END;
$function$;

-- Function to get decrypted TOTP secret (SECURITY DEFINER)
CREATE OR REPLACE FUNCTION public.get_totp_secret(
  p_user_id UUID,
  p_encryption_key TEXT
) RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $function$
DECLARE
  v_encrypted TEXT;
  v_decrypted TEXT;
BEGIN
  -- Verify user is authenticated and matches
  IF auth.uid() != p_user_id THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;
  
  -- Get encrypted secret
  SELECT encrypted_secret INTO v_encrypted
  FROM public.secure_totp_secrets
  WHERE user_id = p_user_id;
  
  IF v_encrypted IS NULL THEN
    RETURN NULL;
  END IF;
  
  -- Decrypt and return
  v_decrypted := pgp_sym_decrypt(decode(v_encrypted, 'base64'), p_encryption_key);
  RETURN v_decrypted;
END;
$function$;

-- Function to delete TOTP secret (SECURITY DEFINER)
CREATE OR REPLACE FUNCTION public.delete_totp_secret(p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $function$
BEGIN
  -- Verify user is authenticated and matches
  IF auth.uid() != p_user_id THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;
  
  DELETE FROM public.secure_totp_secrets WHERE user_id = p_user_id;
  RETURN true;
END;
$function$;

-- Function to save backup codes encrypted
CREATE OR REPLACE FUNCTION public.save_backup_codes(
  p_user_id UUID,
  p_codes TEXT[],
  p_encryption_key TEXT
) RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $function$
DECLARE
  v_encrypted_codes TEXT[];
  v_code TEXT;
BEGIN
  IF auth.uid() != p_user_id THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;
  
  -- Encrypt each backup code
  FOREACH v_code IN ARRAY p_codes
  LOOP
    v_encrypted_codes := array_append(
      v_encrypted_codes,
      encode(pgp_sym_encrypt(v_code, p_encryption_key), 'base64')
    );
  END LOOP;
  
  UPDATE public.secure_totp_secrets
  SET 
    backup_codes_encrypted = v_encrypted_codes,
    updated_at = now()
  WHERE user_id = p_user_id;
  
  RETURN true;
END;
$function$;

-- ============================================
-- PHASE 2: Rate Limiting Table
-- ============================================

CREATE TABLE IF NOT EXISTS public.rate_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  identifier TEXT NOT NULL,
  action TEXT NOT NULL,
  attempts INTEGER DEFAULT 1,
  first_attempt_at TIMESTAMPTZ DEFAULT now(),
  last_attempt_at TIMESTAMPTZ DEFAULT now(),
  blocked_until TIMESTAMPTZ DEFAULT NULL,
  UNIQUE(identifier, action)
);

-- Enable RLS but allow service role full access
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_rate_limits_lookup ON public.rate_limits(identifier, action);
CREATE INDEX IF NOT EXISTS idx_rate_limits_cleanup ON public.rate_limits(last_attempt_at);

-- Function to check and update rate limit
CREATE OR REPLACE FUNCTION public.check_rate_limit(
  p_identifier TEXT,
  p_action TEXT,
  p_max_attempts INTEGER DEFAULT 5,
  p_window_seconds INTEGER DEFAULT 300,
  p_block_seconds INTEGER DEFAULT 900
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  v_record rate_limits%ROWTYPE;
  v_now TIMESTAMPTZ := now();
  v_window_start TIMESTAMPTZ := v_now - (p_window_seconds || ' seconds')::interval;
  v_is_blocked BOOLEAN := false;
  v_remaining INTEGER := p_max_attempts;
BEGIN
  -- Get existing record
  SELECT * INTO v_record
  FROM rate_limits
  WHERE identifier = p_identifier AND action = p_action
  FOR UPDATE;
  
  IF v_record IS NULL THEN
    -- First attempt
    INSERT INTO rate_limits (identifier, action, attempts, first_attempt_at, last_attempt_at)
    VALUES (p_identifier, p_action, 1, v_now, v_now);
    v_remaining := p_max_attempts - 1;
  ELSE
    -- Check if currently blocked
    IF v_record.blocked_until IS NOT NULL AND v_record.blocked_until > v_now THEN
      RETURN jsonb_build_object(
        'allowed', false,
        'blocked', true,
        'blocked_until', v_record.blocked_until,
        'remaining', 0
      );
    END IF;
    
    -- Reset if outside window
    IF v_record.first_attempt_at < v_window_start THEN
      UPDATE rate_limits
      SET attempts = 1, first_attempt_at = v_now, last_attempt_at = v_now, blocked_until = NULL
      WHERE id = v_record.id;
      v_remaining := p_max_attempts - 1;
    ELSE
      -- Increment attempts
      v_remaining := p_max_attempts - v_record.attempts - 1;
      
      IF v_record.attempts >= p_max_attempts THEN
        -- Block user
        UPDATE rate_limits
        SET blocked_until = v_now + (p_block_seconds || ' seconds')::interval,
            last_attempt_at = v_now
        WHERE id = v_record.id;
        
        RETURN jsonb_build_object(
          'allowed', false,
          'blocked', true,
          'blocked_until', v_now + (p_block_seconds || ' seconds')::interval,
          'remaining', 0
        );
      ELSE
        UPDATE rate_limits
        SET attempts = attempts + 1, last_attempt_at = v_now
        WHERE id = v_record.id;
      END IF;
    END IF;
  END IF;
  
  RETURN jsonb_build_object(
    'allowed', true,
    'blocked', false,
    'remaining', GREATEST(v_remaining, 0)
  );
END;
$function$;

-- Cleanup old rate limit records (run periodically)
CREATE OR REPLACE FUNCTION public.cleanup_rate_limits()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  v_deleted INTEGER;
BEGIN
  DELETE FROM rate_limits
  WHERE last_attempt_at < now() - interval '1 day'
  RETURNING COUNT(*) INTO v_deleted;
  
  RETURN COALESCE(v_deleted, 0);
END;
$function$;

-- ============================================
-- PHASE 3: Enhanced Login Attempts Table
-- ============================================

-- Add new columns to login_attempts if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' 
                 AND table_name = 'login_attempts' 
                 AND column_name = 'device_fingerprint') THEN
    ALTER TABLE public.login_attempts ADD COLUMN device_fingerprint TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' 
                 AND table_name = 'login_attempts' 
                 AND column_name = 'failed_reason') THEN
    ALTER TABLE public.login_attempts ADD COLUMN failed_reason TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' 
                 AND table_name = 'login_attempts' 
                 AND column_name = 'country') THEN
    ALTER TABLE public.login_attempts ADD COLUMN country TEXT;
  END IF;
END $$;