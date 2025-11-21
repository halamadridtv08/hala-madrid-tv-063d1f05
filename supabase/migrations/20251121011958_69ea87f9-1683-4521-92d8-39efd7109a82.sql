-- Fix the email type issue by explicitly casting to text
DROP FUNCTION IF EXISTS public.get_users_with_roles();

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
  -- Check if the calling user is an admin
  IF NOT has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Access denied: admin role required';
  END IF;

  RETURN QUERY
  SELECT 
    ur.user_id,
    au.email::text,
    ur.role,
    ur.created_at
  FROM public.user_roles ur
  INNER JOIN auth.users au ON au.id = ur.user_id
  ORDER BY ur.created_at DESC;
END;
$$;