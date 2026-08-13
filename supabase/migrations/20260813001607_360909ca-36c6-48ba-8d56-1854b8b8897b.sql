-- 1. Remove duplicate management policy on kits
DROP POLICY IF EXISTS "Admins can manage kits" ON public.kits;

-- 2. Restrict live chat reads to authenticated users (display names are user-derived)
DROP POLICY IF EXISTS "Anyone can read visible chat messages" ON public.live_chat_messages;

REVOKE SELECT ON public.live_chat_messages FROM anon;

CREATE POLICY "Authenticated users can read visible chat messages"
ON public.live_chat_messages
FOR SELECT
TO authenticated
USING (
  is_hidden = false
  OR has_role(auth.uid(), 'admin'::app_role)
  OR has_role(auth.uid(), 'moderator'::app_role)
);