-- S'assurer que le bucket media existe et est public
UPDATE storage.buckets 
SET public = true 
WHERE id = 'media';

-- Si le bucket n'existe pas, le créer
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('media', 'media', true, 52428800)
ON CONFLICT (id) DO UPDATE SET 
  public = true,
  file_size_limit = 52428800;

-- Supprimer les anciennes politiques s'il y en a
DROP POLICY IF EXISTS "Allow authenticated users to upload files" ON storage.objects;
DROP POLICY IF EXISTS "Allow public access to view files" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to update files" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to delete files" ON storage.objects;

-- Créer des politiques de storage pour permettre l'accès aux fichiers
CREATE POLICY "Allow authenticated users to upload files" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'media' AND 
  auth.role() = 'authenticated'
);

CREATE POLICY "Allow public access to view files" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'media');

CREATE POLICY "Allow authenticated users to update files" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'media' AND 
  auth.role() = 'authenticated'
);

CREATE POLICY "Allow authenticated users to delete files" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'media' AND 
  auth.role() = 'authenticated'
);