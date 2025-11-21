-- Create role change history table
CREATE TABLE IF NOT EXISTS public.user_role_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  old_role app_role,
  new_role app_role NOT NULL,
  changed_by uuid NOT NULL,
  changed_by_email text,
  reason text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_role_history ENABLE ROW LEVEL SECURITY;

-- Policy for admins to view history
CREATE POLICY "Admins can view role history"
ON public.user_role_history
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'));

-- Policy for admins to insert history
CREATE POLICY "Admins can insert role history"
ON public.user_role_history
FOR INSERT
TO authenticated
WITH CHECK (has_role(auth.uid(), 'admin'));

-- Update the get_users_with_roles function to be more secure
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
    au.email,
    ur.role,
    ur.created_at
  FROM public.user_roles ur
  INNER JOIN auth.users au ON au.id = ur.user_id
  ORDER BY ur.created_at DESC;
END;
$$;

-- Function to get role history
CREATE OR REPLACE FUNCTION public.get_role_history(p_user_id uuid DEFAULT NULL)
RETURNS TABLE (
  id uuid,
  user_id uuid,
  user_email text,
  old_role app_role,
  new_role app_role,
  changed_by uuid,
  changed_by_email text,
  reason text,
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
    h.id,
    h.user_id,
    au.email as user_email,
    h.old_role,
    h.new_role,
    h.changed_by,
    h.changed_by_email,
    h.reason,
    h.created_at
  FROM public.user_role_history h
  INNER JOIN auth.users au ON au.id = h.user_id
  WHERE p_user_id IS NULL OR h.user_id = p_user_id
  ORDER BY h.created_at DESC;
END;
$$;

-- Function to log role changes (called by trigger)
CREATE OR REPLACE FUNCTION public.log_role_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_changed_by_email text;
BEGIN
  -- Get the email of the user making the change
  SELECT email INTO v_changed_by_email
  FROM auth.users
  WHERE id = auth.uid();

  -- Insert into history
  INSERT INTO public.user_role_history (
    user_id,
    old_role,
    new_role,
    changed_by,
    changed_by_email
  )
  VALUES (
    COALESCE(NEW.user_id, OLD.user_id),
    OLD.role,
    NEW.role,
    auth.uid(),
    v_changed_by_email
  );

  RETURN NEW;
END;
$$;

-- Create trigger for role changes
DROP TRIGGER IF EXISTS on_role_change ON public.user_roles;
CREATE TRIGGER on_role_change
  AFTER UPDATE OF role ON public.user_roles
  FOR EACH ROW
  EXECUTE FUNCTION public.log_role_change();

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.get_users_with_roles() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_role_history(uuid) TO authenticated;