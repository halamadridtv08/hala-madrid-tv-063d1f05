
import { useState, useRef } from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Image, Video, Upload } from "lucide-react";

interface Article {
  id: string;
  title: string;
  description: string;
  content: string;
  image_url: string | null;
  category: string;
  published_at: string;
  is_published: boolean;
  read_time: string | null;
  featured: boolean;
}

interface ArticleFormProps {
  editingArticle: Article | null;
  onCancel: () => void;
  onSuccess: () => void;
  userId: string | undefined;
}

export const ArticleForm = ({ 
  editingArticle, 
  onCancel, 
  onSuccess,
  userId
}: ArticleFormProps) => {
  // Form state
  const [title, setTitle] = useState(editingArticle?.title || "");
  const [description, setDescription] = useState(editingArticle?.description || "");
  const [content, setContent] = useState(editingArticle?.content || "");
  const [imageUrl, setImageUrl] = useState(editingArticle?.image_url || "");
  const [category, setCategory] = useState(editingArticle?.category || "match");
  const [readTime, setReadTime] = useState(editingArticle?.read_time || "");
  const [isPublished, setIsPublished] = useState(editingArticle?.is_published || false);
  const [isFeatured, setIsFeatured] = useState(editingArticle?.featured || false);
  const [uploading, setUploading] = useState(false);
  
  const { toast } = useToast();
  
  // Refs for file inputs
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (!userId) {
        throw new Error("Utilisateur non connecté");
      }
      
      const articleData = {
        title,
        description,
        content,
        image_url: imageUrl || null,
        category,
        read_time: readTime || null,
        is_published: isPublished,
        featured: isFeatured,
        author_id: userId
      };
      
      let response;
      
      if (editingArticle) {
        response = await supabase
          .from('articles')
          .update(articleData)
          .eq('id', editingArticle.id);
      } else {
        response = await supabase
          .from('articles')
          .insert([articleData]);
      }
      
      if (response.error) throw response.error;
      
      toast({
        title: editingArticle ? "Article mis à jour" : "Article créé",
        description: editingArticle ? "L'article a été mis à jour avec succès" : "L'article a été créé avec succès"
      });
      
      onSuccess();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: error.message || "Une erreur est survenue"
      });
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const file = e.target.files[0];
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
    const filePath = `uploads/${fileName}`;
    
    try {
      setUploading(true);
      
      // Upload the file to Supabase Storage
      const { error: uploadError, data } = await supabase.storage
        .from('media')
        .upload(filePath, file);
        
      if (uploadError) throw uploadError;
      
      // Get the public URL
      const { data: urlData } = supabase.storage
        .from('media')
        .getPublicUrl(filePath);
        
      if (urlData) {
        setImageUrl(urlData.publicUrl);
        
        toast({
          title: "Fichier téléchargé",
          description: "Le fichier a été téléchargé avec succès."
        });
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erreur de téléchargement",
        description: error.message || "Une erreur est survenue lors du téléchargement"
      });
    } finally {
      setUploading(false);
      // Reset file input
      if (imageInputRef.current) imageInputRef.current.value = '';
    }
  };

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const file = e.target.files[0];
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
    const filePath = `videos/${fileName}`;
    
    try {
      setUploading(true);
      
      // Upload the file to Supabase Storage
      const { error: uploadError, data } = await supabase.storage
        .from('media')
        .upload(filePath, file);
        
      if (uploadError) throw uploadError;
      
      // Get the public URL
      const { data: urlData } = supabase.storage
        .from('media')
        .getPublicUrl(filePath);
        
      if (urlData) {
        // Insert the video tag into the content
        const videoTag = `<video controls width="100%" src="${urlData.publicUrl}"></video>`;
        setContent(content => content + '\n\n' + videoTag);
        
        toast({
          title: "Vidéo téléchargée",
          description: "La vidéo a été téléchargée et ajoutée à l'article."
        });
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erreur de téléchargement",
        description: error.message || "Une erreur est survenue lors du téléchargement"
      });
    } finally {
      setUploading(false);
      // Reset file input
      if (videoInputRef.current) videoInputRef.current.value = '';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{editingArticle ? "Modifier l'article" : "Créer un nouvel article"}</CardTitle>
        <CardDescription>
          Remplissez le formulaire ci-dessous pour {editingArticle ? "modifier" : "créer"} un article.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-4">
            <div className="grid gap-2">
              <label htmlFor="title">Titre*</label>
              <Input 
                id="title" 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Titre de l'article"
                required
              />
            </div>
            
            <div className="grid gap-2">
              <label htmlFor="description">Description*</label>
              <Textarea 
                id="description" 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brève description de l'article"
                required
                rows={2}
              />
            </div>
            
            <div className="grid gap-2">
              <label htmlFor="content">Contenu*</label>
              <div className="flex flex-wrap gap-2 mb-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  onClick={() => imageInputRef.current?.click()}
                  disabled={uploading}
                >
                  <Image className="mr-2 h-4 w-4" />
                  Ajouter une image
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  onClick={() => videoInputRef.current?.click()}
                  disabled={uploading}
                >
                  <Video className="mr-2 h-4 w-4" />
                  Ajouter une vidéo
                </Button>
                <input 
                  type="file" 
                  accept="image/*" 
                  ref={imageInputRef}
                  onChange={handleImageUpload}
                  className="hidden" 
                />
                <input 
                  type="file" 
                  accept="video/*" 
                  ref={videoInputRef}
                  onChange={handleVideoUpload}
                  className="hidden" 
                />
                {uploading && <span className="text-sm text-gray-500">Téléchargement en cours...</span>}
              </div>
              <Textarea 
                id="content" 
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Contenu complet de l'article"
                required
                rows={10}
              />
            </div>
            
            <div className="grid gap-2">
              <label htmlFor="image_url">URL de l'image</label>
              <div className="flex gap-2">
                <Input 
                  id="image_url" 
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  className="flex-1"
                />
                <Button 
                  type="button"
                  variant="outline"
                  onClick={() => imageInputRef.current?.click()}
                  disabled={uploading}
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Upload
                </Button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="grid gap-2">
                <label htmlFor="category">Catégorie*</label>
                <Select value={category} onValueChange={setCategory} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez une catégorie" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="match">Match</SelectItem>
                    <SelectItem value="joueur">Joueur</SelectItem>
                    <SelectItem value="conférence">Conférence</SelectItem>
                    <SelectItem value="mercato">Mercato</SelectItem>
                    <SelectItem value="hommage">Hommage</SelectItem>
                    <SelectItem value="formation">Formation</SelectItem>
                    <SelectItem value="info">Info</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid gap-2">
                <label htmlFor="read_time">Temps de lecture</label>
                <Input 
                  id="read_time" 
                  value={readTime}
                  onChange={(e) => setReadTime(e.target.value)}
                  placeholder="3 min"
                />
              </div>
              
              <div className="flex items-end gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={isPublished}
                    onChange={() => setIsPublished(!isPublished)}
                    className="w-4 h-4"
                  />
                  Publier
                </label>
                
                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={isFeatured}
                    onChange={() => setIsFeatured(!isFeatured)}
                    className="w-4 h-4"
                  />
                  À la une
                </label>
              </div>
            </div>
          </div>
          
          <div className="flex gap-2 justify-end">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onCancel}
            >
              Annuler
            </Button>
            <Button type="submit">
              {editingArticle ? "Mettre à jour" : "Créer"} l'article
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
