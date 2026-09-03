-- 1. blocked_email_domains: standardize on has_role()
DROP POLICY IF EXISTS "Only admins can modify domains" ON public.blocked_email_domains;
CREATE POLICY "Only admins can modify domains"
ON public.blocked_email_domains
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- 2. match_automation_settings: standardize on has_role()
DROP POLICY IF EXISTS "Admins can manage automation settings" ON public.match_automation_settings;
CREATE POLICY "Admins can manage automation settings"
ON public.match_automation_settings
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'moderator'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'moderator'::app_role));

-- 3. player_alerts: remove fully public SELECT, restrict to staff
DROP POLICY IF EXISTS "Anyone can view alerts" ON public.player_alerts;
DROP POLICY IF EXISTS "Admins can manage alerts" ON public.player_alerts;

CREATE POLICY "Staff can view alerts"
ON public.player_alerts
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'moderator'::app_role));

CREATE POLICY "Admins can manage alerts"
ON public.player_alerts
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

REVOKE SELECT ON public.player_alerts FROM anon;