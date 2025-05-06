
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

// Génère un nom de fichier unique
export const generateUniqueFileName = (file: File) => {
  const fileExt = file.name.split('.').pop();
  const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
  return fileName;
};

// Fonction pour uploader un fichier à Supabase Storage
export const uploadFile = async (file: File, bucketName: string = 'media', folderPath: string = '') => {
  try {
    // Vérification que le bucket existe
    const { data: buckets } = await supabase.storage.listBuckets();
    if (!buckets?.find(bucket => bucket.name === bucketName)) {
      console.error(`Le bucket "${bucketName}" n'existe pas.`);
      return { error: `Le bucket "${bucketName}" n'existe pas.` };
    }
    
    const fileName = generateUniqueFileName(file);
    let filePath = fileName;
    
    if (folderPath) {
      filePath = `${folderPath}/${fileName}`;
    }
    
    // Upload du fichier
    const { error: uploadError, data } = await supabase.storage
      .from(bucketName)
      .upload(filePath, file);
      
    if (uploadError) {
      console.error('Erreur lors de l\'upload:', uploadError);
      return { error: uploadError.message };
    }
    
    // Récupération de l'URL publique
    const { data: urlData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(filePath);
    
    if (!urlData) {
      return { error: "Impossible d'obtenir l'URL du fichier" };
    }
    
    return { url: urlData.publicUrl, path: filePath, fileName };
  } catch (error: any) {
    console.error('Erreur lors de l\'upload:', error);
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
