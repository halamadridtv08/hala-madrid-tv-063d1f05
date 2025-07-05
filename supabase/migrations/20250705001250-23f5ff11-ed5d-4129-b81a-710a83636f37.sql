
-- Créer des politiques pour permettre l'upload de fichiers dans le bucket media
INSERT INTO storage.buckets (id, name, public) 
VALUES ('media', 'media', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Politique pour permettre à tous les utilisateurs authentifiés d'uploader des fichiers
CREATE POLICY "Authenticated users can upload files" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'media' AND 
  auth.role() = 'authenticated'
);

-- Politique pour permettre à tous de voir les fichiers (car le bucket est public)
CREATE POLICY "Public can view files" ON storage.objects
FOR SELECT USING (bucket_id = 'media');

-- Politique pour permettre aux utilisateurs authentifiés de mettre à jour leurs fichiers
CREATE POLICY "Authenticated users can update files" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'media' AND 
  auth.role() = 'authenticated'
);

-- Politique pour permettre aux utilisateurs authentifiés de supprimer leurs fichiers
CREATE POLICY "Authenticated users can delete files" ON storage.objects
FOR DELETE USING (
  bucket_id = 'media' AND 
  auth.role() = 'authenticated'
);
