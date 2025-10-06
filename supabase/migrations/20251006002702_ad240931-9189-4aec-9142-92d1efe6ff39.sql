-- Fix login_attempts security issue
-- Ensure RLS is enabled on login_attempts table
ALTER TABLE public.login_attempts ENABLE ROW LEVEL SECURITY;

-- Drop old policy that references the admins table
DROP POLICY IF EXISTS "Only admins can view login attempts" ON public.login_attempts;

-- Create explicit deny policy for non-authenticated users
CREATE POLICY "Deny public access to login attempts"
ON public.login_attempts
FOR ALL
TO anon
USING (false);

-- Create policy allowing only admins to view/manage login attempts using the new role system
CREATE POLICY "Only admins can access login attempts"
ON public.login_attempts
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Add comment explaining the security model
COMMENT ON TABLE public.login_attempts IS 'Stores login attempts for security monitoring. Access restricted to admin users only via RLS policies.';