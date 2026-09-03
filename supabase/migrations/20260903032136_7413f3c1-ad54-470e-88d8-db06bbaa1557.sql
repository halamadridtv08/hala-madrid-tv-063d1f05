CREATE OR REPLACE FUNCTION public.delete_totp_secret(p_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL OR auth.uid() <> p_user_id THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;
  DELETE FROM secure_totp_secrets WHERE user_id = p_user_id;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.delete_totp_secret(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.delete_totp_secret(uuid) TO authenticated, service_role;

DROP POLICY IF EXISTS "Anyone can view kit images" ON public.kit_images;
CREATE POLICY "Anyone can view images of published kits"
ON public.kit_images FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.kits k
    WHERE k.id = kit_images.kit_id AND k.is_published = true
  )
  OR has_role(auth.uid(), 'admin'::app_role)
  OR has_role(auth.uid(), 'moderator'::app_role)
);