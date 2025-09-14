-- Supprimer toutes les politiques existantes pour la table videos
DROP POLICY IF EXISTS "Anyone can view published videos" ON public.videos;
DROP POLICY IF EXISTS "Authenticated users can insert videos" ON public.videos;
DROP POLICY IF EXISTS "Authenticated users can update videos" ON public.videos;
DROP POLICY IF EXISTS "Authenticated users can delete videos" ON public.videos;

-- Créer des politiques RLS simplifiées et fonctionnelles
CREATE POLICY "Allow public read access to published videos" 
ON public.videos 
FOR SELECT 
USING (is_published = true);

CREATE POLICY "Allow authenticated users to create videos" 
ON public.videos 
FOR INSERT 
TO authenticated
WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update videos" 
ON public.videos 
FOR UPDATE 
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow authenticated users to delete videos" 
ON public.videos 
FOR DELETE 
TO authenticated
USING (true);