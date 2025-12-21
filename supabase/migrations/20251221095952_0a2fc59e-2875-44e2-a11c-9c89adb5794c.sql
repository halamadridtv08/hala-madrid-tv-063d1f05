-- Fix 1: Remove hardcoded fallback key from get_encryption_key function
-- This ensures the function fails securely if Vault is not configured
CREATE OR REPLACE FUNCTION public.get_encryption_key()
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_key text;
BEGIN
  -- Try to get from vault
  SELECT decrypted_secret INTO v_key 
  FROM vault.decrypted_secrets 
  WHERE name = 'TOTP_ENCRYPTION_KEY'
  LIMIT 1;
  
  -- Fail securely if not configured - never use hardcoded key
  IF v_key IS NULL THEN
    RAISE EXCEPTION 'TOTP_ENCRYPTION_KEY not configured in Vault. Please configure the secret before using 2FA features.';
  END IF;
  
  RETURN v_key;
END;
$function$;

-- Fix 2: Restrict storage policies to admin-only for update/delete operations
-- Drop existing overly permissive policies
DROP POLICY IF EXISTS "Authenticated users can update files" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete files" ON storage.objects;

-- Create admin-only policies for file modifications
CREATE POLICY "Admins can update files" 
ON storage.objects FOR UPDATE 
USING (
  bucket_id = 'media' AND 
  public.has_role(auth.uid(), 'admin')
);

CREATE POLICY "Admins can delete files" 
ON storage.objects FOR DELETE 
USING (
  bucket_id = 'media' AND 
  public.has_role(auth.uid(), 'admin')
);