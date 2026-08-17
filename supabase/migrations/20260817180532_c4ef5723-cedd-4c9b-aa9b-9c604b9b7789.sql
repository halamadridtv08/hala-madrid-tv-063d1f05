-- article_images: only expose images of published articles publicly
DROP POLICY IF EXISTS "Public can view article images" ON public.article_images;
CREATE POLICY "Public can view images of published articles"
ON public.article_images FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.articles a
    WHERE a.id = article_images.article_id AND a.is_published = true
  )
  OR has_role(auth.uid(), 'admin'::app_role)
  OR has_role(auth.uid(), 'moderator'::app_role)
);

-- media_items: hide unpublished items from the public
DROP POLICY IF EXISTS "Allow public read access to media_items" ON public.media_items;
CREATE POLICY "Public can view published media items"
ON public.media_items FOR SELECT
USING (
  is_published = true
  OR has_role(auth.uid(), 'admin'::app_role)
  OR has_role(auth.uid(), 'moderator'::app_role)
);

CREATE POLICY "Admins and moderators can manage media items"
ON public.media_items FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'moderator'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'moderator'::app_role));

-- match_predictions: users only see their own predictions
DROP POLICY IF EXISTS "Authenticated users can view predictions for finished matches" ON public.match_predictions;