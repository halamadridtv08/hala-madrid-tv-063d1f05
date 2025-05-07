
import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useFileUpload, validateFileSize, formatFileSize } from "@/utils/fileUpload";
import { Upload, Image as ImageIcon, Video, File, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface MediaUploaderProps {
  onSuccess: (url: string, type?: string) => void;
  acceptTypes?: string;
  maxSizeMB?: number;
  folderPath?: string;
  bucketName?: string;
  buttonText?: string;
  showPreview?: boolean;
  className?: string;
  currentValue?: string;
}

export function MediaUploader({
  onSuccess,
  acceptTypes = "image/*,video/*",
  maxSizeMB = 50,
  folderPath = "",
  bucketName = "media",
  buttonText = "Ajouter un média",
  showPreview = true,
  className = "",
  currentValue = ""
}: MediaUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [preview, setPreview] = useState<string | null>(currentValue);
  const [fileType, setFileType] = useState<string | null>(currentValue ? (currentValue.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? 'image' : 'video') : null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { uploadFileWithToast } = useFileUpload();
  const { toast } = useToast();

  // Simulation de progression pour donner un feedback visuel
  const simulateProgress = () => {
    setProgress(0);
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 95) {
          clearInterval(interval);
          return prev;
        }
        return prev + 5;
      });
    }, 100);
    
    return () => clearInterval(interval);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const file = e.target.files[0];
    console.log("Fichier sélectionné:", file.name, file.type, formatFileSize(file.size));
    
    // Validation de la taille du fichier
    if (!validateFileSize(file, maxSizeMB)) {
      toast({
        title: "Fichier trop volumineux",
        description: `La taille maximale autorisée est de ${maxSizeMB}MB. Taille actuelle: ${formatFileSize(file.size)}`,
        variant: "destructive"
      });
      return;
    }
    
    // Affichage de la prévisualisation
    if (showPreview) {
      if (file.type.startsWith('image/')) {
        setFileType('image');
        const reader = new FileReader();
        reader.onload = (e) => {
          setPreview(e.target?.result as string);
        };
        reader.readAsDataURL(file);
      } else if (file.type.startsWith('video/')) {
        setFileType('video');
        setPreview(URL.createObjectURL(file));
      } else {
        setFileType('file');
        setPreview(null);
      }
    }
    
    // Upload du fichier
    try {
      setUploading(true);
      const cleanupProgress = simulateProgress();
      
      const result = await uploadFileWithToast(file, bucketName, folderPath);
      
      if (result && result.url) {
        setProgress(100);
        onSuccess(result.url, result.fileType);
      }
      
      cleanupProgress();
      setUploading(false);
      
      // Réinitialiser l'input file
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      setUploading(false);
      console.error("Erreur d'upload:", error);
    }
  };

  const getIconByFileType = () => {
    switch (fileType) {
      case 'image':
        return <ImageIcon className="w-6 h-6" />;
      case 'video':
        return <Video className="w-6 h-6" />;
      default:
        return <File className="w-6 h-6" />;
    }
  };

  const clearPreview = () => {
    setPreview(null);
    setFileType(null);
    onSuccess('');
  };

  return (
    <div className={`flex flex-col gap-4 ${className}`}>
      <input
        type="file"
        ref={fileInputRef}
        accept={acceptTypes}
        onChange={handleFileChange}
        className="hidden"
        disabled={uploading}
      />
      
      <Button
        type="button"
        variant="outline"
        onClick={() => fileInputRef.current?.click()}
        disabled={uploading}
        className="flex items-center gap-2"
      >
        <Upload className="w-4 h-4" />
        {buttonText}
      </Button>
      
      {uploading && (
        <div className="mt-2">
          <Progress value={progress} className="h-2" />
          <p className="text-xs text-muted-foreground mt-1">
            {progress < 100 ? "Téléchargement en cours..." : "Traitement en cours..."}
          </p>
        </div>
      )}
      
      {showPreview && preview && (
        <div className="mt-2 border rounded-md p-2 bg-muted/20 relative">
          <div className="flex items-center gap-2 mb-2">
            {getIconByFileType()}
            <span className="text-sm font-medium">Aperçu</span>
            <Button 
              variant="ghost" 
              size="icon" 
              className="ml-auto h-6 w-6 rounded-full p-0 hover:bg-red-100"
              onClick={clearPreview}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
          
          {fileType === 'image' && (
            <img 
              src={preview} 
              alt="Aperçu" 
              className="max-h-40 rounded-md object-contain mx-auto" 
            />
          )}
          
          {fileType === 'video' && (
            <video 
              src={preview} 
              controls 
              className="max-h-40 rounded-md w-full" 
            />
          )}
        </div>
      )}
    </div>
  );
}
