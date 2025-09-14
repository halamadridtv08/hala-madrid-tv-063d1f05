-- Corriger les politiques RLS pour la table videos
-- Supprimer les anciennes politiques
DROP POLICY IF EXISTS "Authenticated users can manage videos" ON public.videos;

-- Créer les nouvelles politiques avec les bonnes conditions
CREATE POLICY "Authenticated users can insert videos" 
ON public.videos 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update videos" 
ON public.videos 
FOR UPDATE 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete videos" 
ON public.videos 
FOR DELETE 
USING (auth.uid() IS NOT NULL);