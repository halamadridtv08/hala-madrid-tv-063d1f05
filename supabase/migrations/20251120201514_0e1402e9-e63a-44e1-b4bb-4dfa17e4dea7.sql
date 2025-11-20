-- Drop existing policies on flash_news to recreate them with new permissions
DROP POLICY IF EXISTS "Admins can manage flash news" ON public.flash_news;
DROP POLICY IF EXISTS "Anyone can view published flash news" ON public.flash_news;

-- Moderators can create and submit flash news (draft and pending status)
CREATE POLICY "Moderators can create and submit flash news"
ON public.flash_news
FOR INSERT
TO authenticated
WITH CHECK (
  has_role(auth.uid(), 'moderator'::app_role) OR 
  has_role(auth.uid(), 'admin'::app_role)
);

-- Moderators can view and update their own flash news in draft/pending status
CREATE POLICY "Moderators can manage their own draft/pending flash news"
ON public.flash_news
FOR UPDATE
TO authenticated
USING (
  (has_role(auth.uid(), 'moderator'::app_role) OR has_role(auth.uid(), 'admin'::app_role))
  AND status IN ('draft', 'pending')
)
WITH CHECK (
  (has_role(auth.uid(), 'moderator'::app_role) OR has_role(auth.uid(), 'admin'::app_role))
  AND status IN ('draft', 'pending')
);

-- Admins can approve and publish flash news
CREATE POLICY "Admins can approve and publish flash news"
ON public.flash_news
FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Admins can delete any flash news
CREATE POLICY "Admins can delete flash news"
ON public.flash_news
FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Moderators and admins can view all flash news
CREATE POLICY "Moderators and admins can view all flash news"
ON public.flash_news
FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'moderator'::app_role) OR 
  has_role(auth.uid(), 'admin'::app_role)
);

-- Public can view published flash news
CREATE POLICY "Public can view published flash news"
ON public.flash_news
FOR SELECT
TO anon
USING (is_published = true AND status = 'published');