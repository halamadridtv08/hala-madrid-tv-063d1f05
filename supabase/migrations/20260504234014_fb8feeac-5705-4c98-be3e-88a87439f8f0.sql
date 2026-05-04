
DROP POLICY IF EXISTS "Domains are publicly readable" ON public.blocked_email_domains;

CREATE POLICY "Admins can view blocked email domains"
ON public.blocked_email_domains
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::public.app_role));
