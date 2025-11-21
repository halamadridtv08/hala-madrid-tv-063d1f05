-- Create a secure function to get user emails for role management
CREATE OR REPLACE FUNCTION public.get_users_with_roles()
RETURNS TABLE (
  user_id uuid,
  email text,
  role app_role,
  created_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ur.user_id,
    au.email,
    ur.role,
    ur.created_at
  FROM public.user_roles ur
  INNER JOIN auth.users au ON au.id = ur.user_id
  ORDER BY ur.created_at DESC;
END;
$$;

-- Grant execute permission to authenticated users with admin role
REVOKE ALL ON FUNCTION public.get_users_with_roles() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_users_with_roles() TO authenticated;