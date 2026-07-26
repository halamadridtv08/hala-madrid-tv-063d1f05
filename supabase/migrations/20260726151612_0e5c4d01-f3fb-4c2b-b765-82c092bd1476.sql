-- Restore admin check on get_users_with_roles
CREATE OR REPLACE FUNCTION public.get_users_with_roles()
 RETURNS TABLE(user_id uuid, email text, role text, created_at timestamp with time zone)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  IF NOT has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'Access denied: admin role required';
  END IF;

  RETURN QUERY
  SELECT 
    u.id as user_id,
    u.email::text,
    COALESCE(ur.role::text, 'user') as role,
    COALESCE(ur.created_at, u.created_at) as created_at
  FROM auth.users u
  LEFT JOIN public.user_roles ur ON u.id = ur.user_id
  WHERE u.email_confirmed_at IS NOT NULL
  ORDER BY ur.created_at DESC NULLS LAST;
END;
$function$;

REVOKE EXECUTE ON FUNCTION public.get_users_with_roles() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_users_with_roles() TO authenticated, service_role;

-- Restrict admin_audit_logs INSERT policy to service_role only
DROP POLICY IF EXISTS "Service role can insert audit logs" ON public.admin_audit_logs;
CREATE POLICY "Service role can insert audit logs"
ON public.admin_audit_logs
FOR INSERT
TO service_role
WITH CHECK (true);