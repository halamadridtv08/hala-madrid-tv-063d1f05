
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

// Création du bucket s'il n'existe pas
export const ensureBucketExists = async (bucketName: string) => {
  try {
    const { data: buckets } = await supabase.storage.listBuckets();
    if (!buckets?.find(bucket => bucket.name === bucketName)) {
      const { error } = await supabase.storage.createBucket(bucketName, {
        public: true,
        fileSizeLimit: 50 * 1024 * 1024, // 50MB
      });
      if (error) throw error;
      console.log(`Bucket "${bucketName}" créé avec succès.`);
    }
    return { success: true };
  } catch (error: any) {
    console.error(`Erreur lors de la création du bucket "${bucketName}":`, error);
    return { error: error.message };
  }
};

// Génère un nom de fichier unique
export const generateUniqueFileName = (file: File) => {
  const fileExt = file.name.split('.').pop();
  const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
  return fileName;
};

// Fonction pour uploader un fichier à Supabase Storage
export const uploadFile = async (file: File, bucketName: string = 'media', folderPath: string = '') => {
  try {
    // Création du bucket s'il n'existe pas
    const bucketResult = await ensureBucketExists(bucketName);
    if (bucketResult.error) {
      return { error: bucketResult.error };
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
    
    return { url: urlData.publicUrl, path: filePath, fileName, fileType: getFileType(file) };
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

// Fonction pour formater la taille du fichier en texte lisible
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  
  return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
};
