
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

// Kept for backwards compatibility - R2 buckets are managed externally.
export const ensureBucketExists = async (_bucketName: string) => {
  return { success: true };
};

// Génère un nom de fichier unique
export const generateUniqueFileName = (file: File) => {
  const timestamp = new Date().getTime();
  const random = Math.floor(Math.random() * 1000);
  const fileExt = file.name.split('.').pop();
  const sanitizedName = file.name
    .split('.')[0]
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .slice(0, 20);
  const fileName = `${sanitizedName}-${timestamp}-${random}.${fileExt}`;
  return fileName;
};

// Upload a file to Cloudflare R2 via a Supabase Edge Function that mints a presigned URL.
// The `bucketName` argument is kept for backwards compatibility and is folded into the
// folder path so existing callers keep their logical namespacing.
export const uploadFile = async (file: File, bucketName: string = 'media', folderPath: string = '') => {
  try {
    const fileName = generateUniqueFileName(file);
    const folderParts = [bucketName, folderPath].filter(Boolean).join('/');

    const { data: sessionData } = await supabase.auth.getSession();
    const accessToken = sessionData.session?.access_token;
    if (!accessToken) {
      return { error: "Vous devez être connecté pour uploader un fichier." };
    }

    const { data, error } = await supabase.functions.invoke('upload-to-r2', {
      body: {
        filename: fileName,
        contentType: file.type || 'application/octet-stream',
        folder: folderParts,
      },
    });

    if (error) {
      console.error("Erreur lors de la génération de l'URL présignée:", error);
      return { error: error.message };
    }

    const { uploadUrl, publicUrl, key } = (data ?? {}) as {
      uploadUrl?: string;
      publicUrl?: string;
      key?: string;
    };

    if (!uploadUrl || !publicUrl) {
      return { error: "Réponse invalide du service d'upload." };
    }

    const putRes = await fetch(uploadUrl, {
      method: 'PUT',
      headers: { 'Content-Type': file.type || 'application/octet-stream' },
      body: file,
    });

    if (!putRes.ok) {
      const text = await putRes.text().catch(() => '');
      console.error('Erreur upload R2:', putRes.status, text);
      return { error: `Upload R2 échoué (${putRes.status})` };
    }

    return { url: publicUrl, path: key ?? fileName, fileName, fileType: getFileType(file) };
  } catch (error: any) {
    console.error("Erreur lors de l'upload:", error);
    return { error: error.message };
  }
};

// Hook personnalisé pour uploader des fichiers avec feedback toast
export const useFileUpload = () => {
  const { toast } = useToast();
  
  const uploadFileWithToast = async (
    file: File, 
    bucketName: string = 'media', 
    folderPath: string = ''
  ) => {
    toast({
      title: "Upload en cours",
      description: `Téléchargement de ${file.name}...`,
    });
    
    const result = await uploadFile(file, bucketName, folderPath);
    
    if (result.error) {
      toast({
        title: "Erreur d'upload",
        description: result.error,
        variant: "destructive"
      });
      return null;
    }
    
    toast({
      title: "Upload réussi",
      description: "Le fichier a été téléchargé avec succès."
    });
    
    return result;
  };
  
  return { uploadFileWithToast };
};

// Fonction pour déterminer le type de fichier
export const getFileType = (file: File) => {
  if (file.type.startsWith('image/')) return 'image';
  if (file.type.startsWith('video/')) return 'video';
  if (file.type.startsWith('audio/')) return 'audio';
  return 'document';
};

// Fonction pour vérifier la taille du fichier (en MB)
export const validateFileSize = (file: File, maxSizeMB: number = 50) => {
  const fileSizeMB = file.size / (1024 * 1024);
  return fileSizeMB <= maxSizeMB;
};

// Fonction pour formater la taille du fichier en texte lisible
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  
  return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
};
