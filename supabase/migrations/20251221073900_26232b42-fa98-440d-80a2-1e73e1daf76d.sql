-- Drop the previous functions and recreate them to use a database-level secret instead of parameter
DROP FUNCTION IF EXISTS public.save_totp_secret(uuid, text, text);
DROP FUNCTION IF EXISTS public.get_totp_secret(uuid, text);
DROP FUNCTION IF EXISTS public.save_backup_codes(uuid, text[], text);
DROP FUNCTION IF EXISTS public.delete_totp_secret(uuid);

-- Create a function to get the encryption key from vault (or use a default for testing)
-- The key should be stored as a secret in Supabase vault
CREATE OR REPLACE FUNCTION public.get_encryption_key()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_key text;
BEGIN
  -- Try to get from vault first
  SELECT decrypted_secret INTO v_key 
  FROM vault.decrypted_secrets 
  WHERE name = 'TOTP_ENCRYPTION_KEY'
  LIMIT 1;
  
  -- If not found, use a hardcoded fallback (should be replaced in production)
  IF v_key IS NULL THEN
    v_key := 'default-encryption-key-change-in-production-32chars';
  END IF;
  
  RETURN v_key;
END;
$$;

-- Save TOTP secret with encryption (no encryption_key parameter needed)
CREATE OR REPLACE FUNCTION public.save_totp_secret(
  p_user_id uuid,
  p_secret text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_key text;
BEGIN
  v_key := get_encryption_key();
  
  INSERT INTO secure_totp_secrets (user_id, encrypted_secret)
  VALUES (
    p_user_id,
    pgp_sym_encrypt(p_secret, v_key)
  )
  ON CONFLICT (user_id) 
  DO UPDATE SET 
    encrypted_secret = pgp_sym_encrypt(p_secret, v_key),
    updated_at = now();
END;
$$;

-- Get decrypted TOTP secret (no encryption_key parameter needed)
CREATE OR REPLACE FUNCTION public.get_totp_secret(
  p_user_id uuid
)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_encrypted bytea;
  v_key text;
BEGIN
  v_key := get_encryption_key();
  
  SELECT encrypted_secret INTO v_encrypted
  FROM secure_totp_secrets
  WHERE user_id = p_user_id;
  
  IF v_encrypted IS NULL THEN
    RETURN NULL;
  END IF;
  
  RETURN pgp_sym_decrypt(v_encrypted, v_key);
END;
$$;

-- Save backup codes (stored as plain text array since they are single-use)
CREATE OR REPLACE FUNCTION public.save_backup_codes(
  p_user_id uuid,
  p_codes text[]
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE secure_totp_secrets
  SET backup_codes = p_codes, updated_at = now()
  WHERE user_id = p_user_id;
END;
$$;

-- Delete TOTP secret
CREATE OR REPLACE FUNCTION public.delete_totp_secret(
  p_user_id uuid
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM secure_totp_secrets WHERE user_id = p_user_id;
END;
$$;

-- Add backup_codes column if it doesn't exist
ALTER TABLE public.secure_totp_secrets 
ADD COLUMN IF NOT EXISTS backup_codes text[] DEFAULT '{}';