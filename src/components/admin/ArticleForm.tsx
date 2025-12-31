import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Article } from "@/types/Article";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { ArticleImageManager } from "./ArticleImageManager";
import { RichTextEditor } from "./RichTextEditor";
import { ArticleTemplates } from "./ArticleTemplates";
import { ArticleImageCropper } from "./ArticleImageCropper";
import { Calendar, Clock, Upload, Crop, Image } from "lucide-react";
import { uploadFile } from "@/utils/fileUpload";
import { useModeratorActions } from "@/hooks/useModeratorActions";

interface ArticleFormProps {
  article?: Article & { scheduled_at?: string; thumbnail_url?: string };
  onSuccess: () => void;
  onCancel: () => void;
  defaultCategory?: string;
}

export const ArticleForm = ({ article, onSuccess, onCancel, defaultCategory }: ArticleFormProps) => {
  const { user } = useAuth();
  const { logArticlePublished } = useModeratorActions();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: article?.title || "",
    description: article?.description || "",
    content: article?.content || "",
    image_url: article?.image_url || "",
    thumbnail_url: article?.thumbnail_url || "",
    video_url: article?.video_url || "",
    category: article?.category || defaultCategory || "",
    is_published: article?.is_published || false,
    featured: article?.featured || false,
    read_time: article?.read_time || "",
    author_id: article?.author_id || user?.id || "",
    scheduled_at: article?.scheduled_at ? new Date(article.scheduled_at).toISOString().slice(0, 16) : "",
  });
  
  const [showCropper, setShowCropper] = useState(false);
  const [imageToCrop, setImageToCrop] = useState<string>("");
  const [cropTarget, setCropTarget] = useState<'image' | 'thumbnail'>('image');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const thumbnailInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user?.id) {
      toast.error("Vous devez être connecté pour créer un article");
      return;
    }

    setLoading(true);

    try {
      const dataToSubmit: any = {
        ...formData,
        author_id: user.id,
        scheduled_at: formData.scheduled_at ? new Date(formData.scheduled_at).toISOString() : null,
      };

      // Si planifié, ne pas publier immédiatement
      if (dataToSubmit.scheduled_at && new Date(dataToSubmit.scheduled_at) > new Date()) {
        dataToSubmit.is_published = false;
      }

      if (article?.id) {
        const { error } = await supabase
          .from('articles')
          .update(dataToSubmit)
          .eq('id', article.id);

        if (error) throw error;
        
        // Log if article is being published
        if (dataToSubmit.is_published && !article.is_published) {
          await logArticlePublished(article.id, formData.title);
        }
        
        toast.success("Article mis à jour avec succès");
      } else {
        const { data: insertedData, error } = await supabase
          .from('articles')
          .insert([dataToSubmit])
          .select('id')
          .single();

        if (error) throw error;
        
        // Log if new article is published directly
        if (dataToSubmit.is_published && insertedData?.id) {
          await logArticlePublished(insertedData.id, formData.title);
        }
        
        toast.success("Article créé avec succès");
      }

      onSuccess();
    } catch (error) {
      console.error('Erreur:', error);
      toast.error("Erreur lors de l'enregistrement de l'article");
    } finally {
      setLoading(false);
    }
  };
  
  const handleTemplateSelect = (template: any) => {
    setFormData({
      ...formData,
      title: template.titleTemplate,
      description: template.descriptionTemplate,
      content: template.contentTemplate,
      category: template.category
    });
    toast.success(`Template "${template.name}" appliqué`);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, target: 'image' | 'thumbnail') => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Vérifier si c'est une image
    if (!file.type.startsWith('image/')) {
      toast.error("Veuillez sélectionner une image");
      return;
    }

    // Afficher l'image dans le cropper
    const reader = new FileReader();
    reader.onload = (event) => {
      setImageToCrop(event.target?.result as string);
      setCropTarget(target);
      setShowCropper(true);
    };
    reader.readAsDataURL(file);
  };

  const handleCroppedImage = async (croppedBlob: Blob) => {
    try {
      toast.info("Upload en cours...");
      
      const file = new File([croppedBlob], `cropped-${Date.now()}.jpg`, { type: 'image/jpeg' });
      const result = await uploadFile(file, 'media', 'articles');
      
      if (result.error) {
        toast.error(result.error);
        return;
      }

      if (cropTarget === 'image') {
        setFormData({ ...formData, image_url: result.url || '' });
      } else {
        setFormData({ ...formData, thumbnail_url: result.url || '' });
      }
      
      toast.success("Image uploadée avec succès");
    } catch (error) {
      console.error('Error uploading cropped image:', error);
      toast.error("Erreur lors de l'upload");
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>
            {article ? "Modifier l'article" : "Nouvel article"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="content" className="w-full">
            <TabsList>
              <TabsTrigger value="content">Contenu</TabsTrigger>
              <TabsTrigger value="media">Médias</TabsTrigger>
              <TabsTrigger value="scheduling">Planification</TabsTrigger>
              {article && <TabsTrigger value="gallery">Galerie</TabsTrigger>}
            </TabsList>

            <TabsContent value="content">
              {!article && (
                <div className="mb-4">
                  <ArticleTemplates onSelectTemplate={handleTemplateSelect} />
                </div>
              )}
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="title">Titre</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="description">Description</Label>
                  <RichTextEditor
                    value={formData.description}
                    onChange={(value) => setFormData({ ...formData, description: value })}
                    placeholder="Description de l'article (avec formatage HTML)..."
                    minRows={5}
                  />
                </div>
                
                <div>
                  <Label htmlFor="content">Contenu</Label>
                  <RichTextEditor
                    value={formData.content}
                    onChange={(value) => setFormData({ ...formData, content: value })}
                    placeholder="Contenu de l'article (avec formatage HTML)..."
                    minRows={15}
                  />
                </div>
                
                <div>
                  <Label htmlFor="category">Catégorie</Label>
                  <Input
                    id="category"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="read_time">Temps de lecture</Label>
                  <Input
                    id="read_time"
                    value={formData.read_time}
                    onChange={(e) => setFormData({ ...formData, read_time: e.target.value })}
                    placeholder="Ex: 5 min"
                  />
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="is_published"
                      checked={formData.is_published}
                      onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
                      disabled={!!formData.scheduled_at}
                    />
                    <Label htmlFor="is_published">Publié {formData.scheduled_at && "(désactivé si planifié)"}</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="featured"
                      checked={formData.featured}
                      onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                    />
                    <Label htmlFor="featured">À la une</Label>
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <Button type="submit" disabled={loading}>
                    {loading ? "Enregistrement..." : "Enregistrer"}
                  </Button>
                  <Button type="button" variant="outline" onClick={onCancel}>
                    Annuler
                  </Button>
                </div>
              </form>
            </TabsContent>

            <TabsContent value="media">
              <div className="space-y-6">
                {/* Image principale */}
                <div className="space-y-3">
                  <Label className="flex items-center gap-2">
                    <Image className="h-4 w-4" />
                    Image de couverture
                  </Label>
                  
                  <div className="flex gap-3">
                    <Input
                      type="url"
                      value={formData.image_url}
                      onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                      placeholder="URL de l'image ou uploader..."
                      className="flex-1"
                    />
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={(e) => handleImageUpload(e, 'image')}
                      accept="image/*"
                      className="hidden"
                    />
                    <Button 
                      type="button" 
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Upload
                    </Button>
                  </div>
                  
                  {formData.image_url && (
                    <div className="relative aspect-video w-full max-w-md rounded-lg overflow-hidden border">
                      <img 
                        src={formData.image_url} 
                        alt="Aperçu" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                </div>

                {/* Miniature */}
                <div className="space-y-3">
                  <Label className="flex items-center gap-2">
                    <Crop className="h-4 w-4" />
                    Miniature (pour les widgets et cartes)
                  </Label>
                  
                  <div className="flex gap-3">
                    <Input
                      type="url"
                      value={formData.thumbnail_url}
                      onChange={(e) => setFormData({ ...formData, thumbnail_url: e.target.value })}
                      placeholder="URL de la miniature ou uploader..."
                      className="flex-1"
                    />
                    <input
                      type="file"
                      ref={thumbnailInputRef}
                      onChange={(e) => handleImageUpload(e, 'thumbnail')}
                      accept="image/*"
                      className="hidden"
                    />
                    <Button 
                      type="button" 
                      variant="outline"
                      onClick={() => thumbnailInputRef.current?.click()}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Upload
                    </Button>
                  </div>
                  
                  {formData.thumbnail_url && (
                    <div className="relative w-48 aspect-square rounded-lg overflow-hidden border">
                      <img 
                        src={formData.thumbnail_url} 
                        alt="Miniature" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                </div>

                {/* Vidéo */}
                <div className="space-y-3">
                  <Label>URL de la vidéo (YouTube ou autre)</Label>
                  <Input
                    type="url"
                    value={formData.video_url}
                    onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
                    placeholder="https://www.youtube.com/watch?v=..."
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="scheduling">
              <div className="space-y-6">
                <div className="p-4 bg-muted rounded-lg">
                  <h3 className="font-semibold flex items-center gap-2 mb-2">
                    <Calendar className="h-5 w-5" />
                    Planification de publication
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Définissez une date et heure pour publier automatiquement cet article.
                    L'article restera en brouillon jusqu'à la date planifiée.
                  </p>
                  
                  <div className="space-y-3">
                    <Label htmlFor="scheduled_at" className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Date et heure de publication
                    </Label>
                    <Input
                      id="scheduled_at"
                      type="datetime-local"
                      value={formData.scheduled_at}
                      onChange={(e) => setFormData({ ...formData, scheduled_at: e.target.value })}
                      min={new Date().toISOString().slice(0, 16)}
                    />
                    
                    {formData.scheduled_at && (
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">
                          Publication prévue le {new Date(formData.scheduled_at).toLocaleDateString('fr-FR', {
                            weekday: 'long',
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                        <Button 
                          type="button" 
                          variant="ghost" 
                          size="sm"
                          onClick={() => setFormData({ ...formData, scheduled_at: '' })}
                        >
                          Annuler la planification
                        </Button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex space-x-2">
                  <Button onClick={handleSubmit} disabled={loading}>
                    {loading ? "Enregistrement..." : "Enregistrer"}
                  </Button>
                  <Button type="button" variant="outline" onClick={onCancel}>
                    Annuler
                  </Button>
                </div>
              </div>
            </TabsContent>

            {article && (
              <TabsContent value="gallery">
                <ArticleImageManager articleId={article.id} />
              </TabsContent>
            )}
          </Tabs>
        </CardContent>
      </Card>

      {showCropper && imageToCrop && (
        <ArticleImageCropper
          image={imageToCrop}
          isOpen={showCropper}
          onClose={() => {
            setShowCropper(false);
            setImageToCrop("");
          }}
          onCropComplete={handleCroppedImage}
        />
      )}
    </>
  );
};
