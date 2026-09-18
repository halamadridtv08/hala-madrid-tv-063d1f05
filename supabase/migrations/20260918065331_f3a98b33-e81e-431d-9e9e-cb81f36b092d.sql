-- 1. Restore column privileges needed by the security_invoker view (including is_flagged used in its WHERE clause)
GRANT SELECT (id, article_id, user_name, content, is_approved, is_published, is_flagged, created_at, updated_at)
  ON public.article_comments TO anon;
GRANT SELECT (id, article_id, user_name, content, is_approved, is_published, is_flagged, created_at, updated_at)
  ON public.article_comments TO authenticated;
GRANT SELECT ON public.article_comments_public TO anon, authenticated;

-- Policy for authenticated readers (anon policy already exists)
DROP POLICY IF EXISTS "Authenticated can read published comments" ON public.article_comments;
CREATE POLICY "Authenticated can read published comments"
ON public.article_comments
FOR SELECT
TO authenticated
USING (is_approved = true AND is_published = true AND is_flagged = false);

-- 2. Poll votes: anon cannot read auth.users inside a policy expression; use a security definer helper
CREATE OR REPLACE FUNCTION public.is_auth_user_identifier(p_identifier text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM auth.users u WHERE u.id::text = p_identifier)
$$;

REVOKE ALL ON FUNCTION public.is_auth_user_identifier(text) FROM public;
GRANT EXECUTE ON FUNCTION public.is_auth_user_identifier(text) TO anon, authenticated, service_role;

DROP POLICY IF EXISTS "Anonymous visitors can vote once per poll" ON public.poll_votes;
CREATE POLICY "Anonymous visitors can vote once per poll"
ON public.poll_votes
FOR INSERT
TO anon
WITH CHECK (
  user_identifier ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
  AND NOT public.is_auth_user_identifier(user_identifier)
);