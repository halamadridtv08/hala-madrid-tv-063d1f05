-- Drop existing TOTP functions with old signatures
DROP FUNCTION IF EXISTS public.save_totp_secret(UUID, TEXT, TEXT);
DROP FUNCTION IF EXISTS public.save_totp_secret(UUID, TEXT);
DROP FUNCTION IF EXISTS public.get_totp_secret(UUID, TEXT);
DROP FUNCTION IF EXISTS public.get_totp_secret(UUID);
DROP FUNCTION IF EXISTS public.save_backup_codes(UUID, TEXT[], TEXT);
DROP FUNCTION IF EXISTS public.save_backup_codes(UUID, TEXT[]);

-- Recreate save_totp_secret using Vault
CREATE OR REPLACE FUNCTION public.save_totp_secret(
  p_user_id UUID,
  p_secret TEXT
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $function$
DECLARE
  v_encrypted TEXT;
  v_result_id UUID;
  v_encryption_key TEXT;
BEGIN
  -- Verify the user is saving their own secret
  IF auth.uid() != p_user_id THEN
    RAISE EXCEPTION 'Unauthorized: Cannot save secret for another user';
  END IF;
  
  -- Get encryption key from Vault
  SELECT decrypted_secret INTO v_encryption_key
  FROM vault.decrypted_secrets
  WHERE name = 'TOTP_ENCRYPTION_KEY';
  
  IF v_encryption_key IS NULL THEN
    RAISE EXCEPTION 'Encryption key not configured in Vault';
  END IF;
  
  -- Encrypt the secret using pgp_sym_encrypt
  v_encrypted := encode(pgp_sym_encrypt(p_secret, v_encryption_key), 'base64');
  
  -- Upsert into secure_totp_secrets
  INSERT INTO public.secure_totp_secrets (user_id, encrypted_secret)
  VALUES (p_user_id, v_encrypted)
  ON CONFLICT (user_id) DO UPDATE SET
    encrypted_secret = EXCLUDED.encrypted_secret,
    updated_at = now()
  RETURNING id INTO v_result_id;
  
  RETURN v_result_id;
END;
$function$;

-- Recreate get_totp_secret using Vault
CREATE OR REPLACE FUNCTION public.get_totp_secret(
  p_user_id UUID
) RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $function$
DECLARE
  v_encrypted TEXT;
  v_decrypted TEXT;
  v_encryption_key TEXT;
BEGIN
  -- Verify the user is getting their own secret
  IF auth.uid() != p_user_id THEN
    RAISE EXCEPTION 'Unauthorized: Cannot get secret for another user';
  END IF;
  
  -- Get the encrypted secret
  SELECT encrypted_secret INTO v_encrypted
  FROM public.secure_totp_secrets
  WHERE user_id = p_user_id;
  
  IF v_encrypted IS NULL THEN
    RETURN NULL;
  END IF;
  
  -- Get encryption key from Vault
  SELECT decrypted_secret INTO v_encryption_key
  FROM vault.decrypted_secrets
  WHERE name = 'TOTP_ENCRYPTION_KEY';
  
  IF v_encryption_key IS NULL THEN
    RAISE EXCEPTION 'Encryption key not configured in Vault';
  END IF;
  
  -- Decrypt the secret
  v_decrypted := pgp_sym_decrypt(decode(v_encrypted, 'base64'), v_encryption_key);
  
  RETURN v_decrypted;
END;
$function$;

-- Recreate save_backup_codes using Vault
CREATE OR REPLACE FUNCTION public.save_backup_codes(
  p_user_id UUID,
  p_codes TEXT[]
) RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $function$
DECLARE
  v_encrypted TEXT;
  v_encryption_key TEXT;
BEGIN
  -- Verify the user is saving their own codes
  IF auth.uid() != p_user_id THEN
    RAISE EXCEPTION 'Unauthorized: Cannot save codes for another user';
  END IF;
  
  -- Get encryption key from Vault
  SELECT decrypted_secret INTO v_encryption_key
  FROM vault.decrypted_secrets
  WHERE name = 'TOTP_ENCRYPTION_KEY';
  
  IF v_encryption_key IS NULL THEN
    RAISE EXCEPTION 'Encryption key not configured in Vault';
  END IF;
  
  -- Encrypt the codes
  v_encrypted := encode(pgp_sym_encrypt(array_to_string(p_codes, ','), v_encryption_key), 'base64');
  
  -- Update the secure_totp_secrets table
  UPDATE public.secure_totp_secrets
  SET backup_codes = v_encrypted,
      updated_at = now()
  WHERE user_id = p_user_id;
  
  RETURN FOUND;
END;
$function$;