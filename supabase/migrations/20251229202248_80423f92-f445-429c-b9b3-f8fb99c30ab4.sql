-- Create secure newsletter subscription function with server-side validation
CREATE OR REPLACE FUNCTION public.subscribe_to_newsletter(
  p_email TEXT,
  p_subscription_type TEXT DEFAULT 'weekly'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_domain TEXT;
  v_subscriber_id UUID;
  v_cleaned_email TEXT;
BEGIN
  -- Clean and normalize email
  v_cleaned_email := LOWER(TRIM(p_email));
  
  -- Validate email format using regex
  IF NOT v_cleaned_email ~ '^[a-zA-Z0-9.!#$%&''*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$' THEN
    RAISE EXCEPTION 'Format d''email invalide';
  END IF;
  
  -- Validate email length
  IF LENGTH(v_cleaned_email) > 255 THEN
    RAISE EXCEPTION 'Email trop long';
  END IF;
  
  -- Extract domain
  v_domain := SPLIT_PART(v_cleaned_email, '@', 2);
  
  -- Check against blocked domains (disposable email services)
  IF EXISTS (
    SELECT 1 FROM public.blocked_email_domains 
    WHERE domain = v_domain AND is_active = true
  ) THEN
    RAISE EXCEPTION 'Ce domaine d''email n''est pas autorisé';
  END IF;
  
  -- Validate subscription type
  IF p_subscription_type NOT IN ('daily', 'weekly', 'monthly') THEN
    RAISE EXCEPTION 'Type d''abonnement invalide';
  END IF;
  
  -- Check if already subscribed
  IF EXISTS (
    SELECT 1 FROM public.newsletter_subscribers 
    WHERE email = v_cleaned_email
  ) THEN
    RAISE EXCEPTION 'ALREADY_SUBSCRIBED';
  END IF;
  
  -- Insert subscriber
  INSERT INTO public.newsletter_subscribers (
    email, 
    subscription_type, 
    confirmation_token
  )
  VALUES (
    v_cleaned_email, 
    p_subscription_type, 
    gen_random_uuid()
  )
  RETURNING id INTO v_subscriber_id;
  
  RETURN v_subscriber_id;
END;
$$;