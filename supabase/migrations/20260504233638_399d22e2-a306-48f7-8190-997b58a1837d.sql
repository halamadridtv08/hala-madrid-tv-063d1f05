
-- Dream teams: require authentication for insert and ownership for update
DROP POLICY IF EXISTS "Anyone can create dream teams" ON public.dream_teams;
DROP POLICY IF EXISTS "Users can update their own dream teams" ON public.dream_teams;

CREATE POLICY "Authenticated users can create dream teams"
ON public.dream_teams
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own dream teams"
ON public.dream_teams
FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Player stats: drop overly permissive insert policy
DROP POLICY IF EXISTS "Autoriser seulement l’utilisateur connecté" ON public.player_stats;

-- Media bucket: drop authenticated-any-user write policies; restrict to admin/moderator
DROP POLICY IF EXISTS "Allow authenticated users to upload files" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to update files" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to delete files" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload files" ON storage.objects;

CREATE POLICY "Admins or moderators can upload to media"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'media'
  AND (public.has_role(auth.uid(), 'admin'::public.app_role)
       OR public.has_role(auth.uid(), 'moderator'::public.app_role))
);

CREATE POLICY "Admins or moderators can update media"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'media'
  AND (public.has_role(auth.uid(), 'admin'::public.app_role)
       OR public.has_role(auth.uid(), 'moderator'::public.app_role))
)
WITH CHECK (
  bucket_id = 'media'
  AND (public.has_role(auth.uid(), 'admin'::public.app_role)
       OR public.has_role(auth.uid(), 'moderator'::public.app_role))
);

CREATE POLICY "Admins or moderators can delete media"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'media'
  AND (public.has_role(auth.uid(), 'admin'::public.app_role)
       OR public.has_role(auth.uid(), 'moderator'::public.app_role))
);
