-- Fix 1: Newsletter subscribers UPDATE policy - make it more restrictive
DROP POLICY IF EXISTS "Subscribers can update their own subscription" ON public.newsletter_subscribers;

-- Create RPC function for safe unsubscribe with token validation
CREATE OR REPLACE FUNCTION public.unsubscribe_newsletter(
  p_email TEXT,
  p_confirmation_token TEXT
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE newsletter_subscribers
  SET is_active = false,
      unsubscribed_at = now()
  WHERE email = p_email
    AND confirmation_token = p_confirmation_token;
  
  RETURN FOUND;
END;
$$;

-- Create RPC function for confirming subscription
CREATE OR REPLACE FUNCTION public.confirm_newsletter_subscription(
  p_email TEXT,
  p_confirmation_token TEXT
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE newsletter_subscribers
  SET is_confirmed = true,
      confirmed_at = now()
  WHERE email = p_email
    AND confirmation_token = p_confirmation_token
    AND is_confirmed = false;
  
  RETURN FOUND;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.unsubscribe_newsletter TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.confirm_newsletter_subscription TO anon, authenticated;

-- Fix 2: Create RPC function to get user email safely (for admin use)
CREATE OR REPLACE FUNCTION public.get_user_email_by_id(p_user_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only admins can get user emails
  IF NOT has_role(auth.uid(), 'admin') THEN
    RETURN NULL;
  END IF;
  
  RETURN (SELECT email FROM auth.users WHERE id = p_user_id);
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_user_email_by_id TO authenticated;