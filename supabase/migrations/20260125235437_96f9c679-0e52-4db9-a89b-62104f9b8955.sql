-- Separate email storage for article comments with stricter access control
-- This addresses the security finding: article_comments_email_exposure

-- Step 1: Create a separate table for comment emails with strict access
CREATE TABLE IF NOT EXISTS public.article_comment_emails (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  comment_id UUID NOT NULL REFERENCES public.article_comments(id) ON DELETE CASCADE,
  user_email TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(comment_id)
);

-- Enable RLS on the new table
ALTER TABLE public.article_comment_emails ENABLE ROW LEVEL SECURITY;

-- Only admins (not moderators) can view emails
CREATE POLICY "Only admins can view comment emails"
ON public.article_comment_emails
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Only admins can insert emails (needed when comments are created)
CREATE POLICY "Only admins can insert comment emails"
ON public.article_comment_emails
FOR INSERT
TO authenticated
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Only admins can delete emails
CREATE POLICY "Only admins can delete comment emails"
ON public.article_comment_emails
FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Allow service role to insert emails (for comment submission from public users)
CREATE POLICY "Service role can manage comment emails"
ON public.article_comment_emails
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Step 2: Migrate existing emails to the new table
INSERT INTO public.article_comment_emails (comment_id, user_email)
SELECT id, user_email
FROM public.article_comments
WHERE user_email IS NOT NULL AND user_email != ''
ON CONFLICT (comment_id) DO NOTHING;

-- Step 3: Remove the user_email column from article_comments
-- This ensures emails are only accessible through the restricted table
ALTER TABLE public.article_comments DROP COLUMN IF EXISTS user_email;

-- Step 4: Create a secure function to submit comments with emails
CREATE OR REPLACE FUNCTION public.submit_article_comment(
  p_article_id UUID,
  p_user_name TEXT,
  p_user_email TEXT,
  p_content TEXT
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_comment_id UUID;
BEGIN
  -- Validate inputs
  IF LENGTH(p_user_name) < 2 OR LENGTH(p_user_name) > 100 THEN
    RAISE EXCEPTION 'Invalid user name length';
  END IF;
  
  IF LENGTH(p_content) < 5 OR LENGTH(p_content) > 5000 THEN
    RAISE EXCEPTION 'Invalid content length';
  END IF;
  
  -- Insert the comment
  INSERT INTO public.article_comments (article_id, user_name, content, is_approved)
  VALUES (p_article_id, p_user_name, p_content, false)
  RETURNING id INTO v_comment_id;
  
  -- Store email separately if provided
  IF p_user_email IS NOT NULL AND p_user_email != '' THEN
    -- Basic email validation
    IF p_user_email !~ '^[a-zA-Z0-9.!#$%&''*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$' THEN
      RAISE EXCEPTION 'Invalid email format';
    END IF;
    
    INSERT INTO public.article_comment_emails (comment_id, user_email)
    VALUES (v_comment_id, p_user_email);
  END IF;
  
  RETURN v_comment_id;
END;
$$;

-- Grant execute to anon and authenticated users
GRANT EXECUTE ON FUNCTION public.submit_article_comment TO anon, authenticated;

-- Step 5: Create a secure function for admins to get comments with emails
CREATE OR REPLACE FUNCTION public.get_article_comments_with_emails(p_article_id UUID)
RETURNS TABLE (
  id UUID,
  article_id UUID,
  user_name TEXT,
  user_email TEXT,
  content TEXT,
  is_approved BOOLEAN,
  is_published BOOLEAN,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only admins can access this function
  IF NOT has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'Access denied: admin role required';
  END IF;
  
  RETURN QUERY
  SELECT 
    c.id,
    c.article_id,
    c.user_name,
    e.user_email,
    c.content,
    c.is_approved,
    c.is_published,
    c.created_at,
    c.updated_at
  FROM public.article_comments c
  LEFT JOIN public.article_comment_emails e ON e.comment_id = c.id
  WHERE c.article_id = p_article_id
  ORDER BY c.created_at DESC;
END;
$$;

-- Grant execute to authenticated users (function itself checks admin role)
GRANT EXECUTE ON FUNCTION public.get_article_comments_with_emails TO authenticated;