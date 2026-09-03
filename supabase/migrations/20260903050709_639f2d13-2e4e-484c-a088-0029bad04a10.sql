-- Remove all direct client access to TOTP secret material
DROP POLICY IF EXISTS "Users can view their own TOTP secret" ON public.secure_totp_secrets;
DROP POLICY IF EXISTS "Users manage own TOTP secrets" ON public.secure_totp_secrets;
DROP POLICY IF EXISTS "Users can insert their own TOTP secret" ON public.secure_totp_secrets;
DROP POLICY IF EXISTS "Users can update their own TOTP secret" ON public.secure_totp_secrets;
DROP POLICY IF EXISTS "Users can delete their own TOTP secret" ON public.secure_totp_secrets;

ALTER TABLE public.secure_totp_secrets ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON public.secure_totp_secrets FROM anon, authenticated;
GRANT ALL ON public.secure_totp_secrets TO service_role;

-- Safe boolean accessor: never returns secret material
CREATE OR REPLACE FUNCTION public.has_totp_enabled()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.secure_totp_secrets
    WHERE user_id = auth.uid()
  );
$$;

REVOKE EXECUTE ON FUNCTION public.has_totp_enabled() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_totp_enabled() TO authenticated, service_role;

-- Admin-side check used during login flow (own user only)
CREATE OR REPLACE FUNCTION public.user_has_totp(p_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL OR auth.uid() <> p_user_id THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;
  RETURN EXISTS (SELECT 1 FROM public.secure_totp_secrets WHERE user_id = p_user_id);
END;
$$;

REVOKE EXECUTE ON FUNCTION public.user_has_totp(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.user_has_totp(uuid) TO authenticated, service_role;