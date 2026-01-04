-- Drop and recreate the function to filter out unconfirmed users
DROP FUNCTION IF EXISTS public.get_users_with_roles();

CREATE FUNCTION public.get_users_with_roles()
RETURNS TABLE (
  user_id uuid,
  email text,
  role text,
  created_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only return users who have confirmed their email
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
$$;