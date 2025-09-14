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

-- Créer des politiques de storage pour permettre l'accès aux fichiers
INSERT INTO storage.policies (id, bucket_id, name, definition, check, command)
VALUES 
  (
    'Allow authenticated users to upload files', 
    'media', 
    'Allow authenticated users to upload files',
    '(auth.role() = ''authenticated''::text)',
    null,
    'INSERT'
  ),
  (
    'Allow public access to view files', 
    'media', 
    'Allow public access to view files',
    'true',
    null,
    'SELECT'
  ),
  (
    'Allow authenticated users to update files', 
    'media', 
    'Allow authenticated users to update files',
    '(auth.role() = ''authenticated''::text)',
    null,
    'UPDATE'
  ),
  (
    'Allow authenticated users to delete files', 
    'media', 
    'Allow authenticated users to delete files',
    '(auth.role() = ''authenticated''::text)',
    null,
    'DELETE'
  )
ON CONFLICT (bucket_id, name) DO NOTHING;