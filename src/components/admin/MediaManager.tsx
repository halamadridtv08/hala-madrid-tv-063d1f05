
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MediaUploader } from "@/components/admin/MediaUploader";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, Image, Video } from "lucide-react";

interface MediaItem {
  id: string;
  title: string;
  description: string | null;
  media_url: string;
  media_type: string;
  category: string | null;
  is_featured: boolean;
  is_published: boolean;
  created_at: string;
}

interface MediaManagerProps {
  entityType: "player" | "coach";
  entityId: string;
  entityName: string;
}

export function MediaManager({ entityType, entityId, entityName }: MediaManagerProps) {
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    media_url: "",
    media_type: "image",
    category: "",
    is_featured: false,
    is_published: true
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchMediaItems();
  }, [entityId]);

  const fetchMediaItems = async () => {
    try {
      const { data, error } = await supabase
        .from('media_items')
        .select('*')
        .eq('entity_type', entityType)
        .eq('entity_id', entityId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMediaItems(data || []);
    } catch (error) {
      console.error('Error fetching media items:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.media_url) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Le titre et l'URL du média sont requis"
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('media_items')
        .insert([{
          entity_type: entityType,
          entity_id: entityId,
          ...formData
        }]);

      if (error) throw error;

      toast({
        title: "Média ajouté",
        description: "Le média a été ajouté avec succès"
      });

      // Reset form
      setFormData({
        title: "",
        description: "",
        media_url: "",
        media_type: "image",
        category: "",
        is_featured: false,
        is_published: true
      });

      fetchMediaItems();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: error.message
      });
    }
  };

  const deleteMediaItem = async (mediaId: string) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer ce média ?")) return;

    try {
      const { error } = await supabase
        .from('media_items')
        .delete()
        .eq('id', mediaId);

      if (error) throw error;

      toast({
        title: "Média supprimé",
        description: "Le média a été supprimé avec succès"
      });

      fetchMediaItems();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: error.message
      });
    }
  };

  const handleMediaUploadSuccess = (url: string, type?: string) => {
    setFormData(prev => ({
      ...prev,
      media_url: url,
      media_type: type === 'video' ? 'video' : 'image'
    }));
  };

  if (loading) return <div>Chargement...</div>;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Ajouter un média pour {entityName}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <Label htmlFor="title">Titre*</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Titre du média"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Description du média"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="media_type">Type de média</Label>
                <Select value={formData.media_type} onValueChange={(value) => setFormData(prev => ({ ...prev, media_type: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="image">Image</SelectItem>
                    <SelectItem value="video">Vidéo</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="category">Catégorie</Label>
                <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner une catégorie" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="profile">Profil</SelectItem>
                    <SelectItem value="action">Action</SelectItem>
                    <SelectItem value="training">Entraînement</SelectItem>
                    <SelectItem value="celebration">Célébration</SelectItem>
                    <SelectItem value="interview">Interview</SelectItem>
                    <SelectItem value="official">Officiel</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="media_url">URL du média</Label>
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <Input
                      id="media_url"
                      value={formData.media_url}
                      onChange={(e) => setFormData(prev => ({ ...prev, media_url: e.target.value }))}
                      placeholder="https://example.com/media.jpg"
                      required
                    />
                  </div>
                  <div className="w-full md:w-72">
                    <MediaUploader
                      onSuccess={handleMediaUploadSuccess}
                      acceptTypes={formData.media_type === 'video' ? 'video/*' : 'image/*'}
                      buttonText={formData.media_type === 'video' ? 'Télécharger vidéo' : 'Télécharger image'}
                      folderPath={`${entityType}s/media`}
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_featured}
                    onChange={(e) => setFormData(prev => ({ ...prev, is_featured: e.target.checked }))}
                    className="w-4 h-4"
                  />
                  Mettre en avant
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_published}
                    onChange={(e) => setFormData(prev => ({ ...prev, is_published: e.target.checked }))}
                    className="w-4 h-4"
                  />
                  Publier
                </label>
              </div>
            </div>

            <Button type="submit" className="w-full">
              <Plus className="mr-2 h-4 w-4" />
              Ajouter le média
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Médias existants</CardTitle>
        </CardHeader>
        <CardContent>
          {mediaItems.length === 0 ? (
            <p className="text-gray-500 text-center py-4">Aucun média enregistré</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {mediaItems.map((media) => (
                <div key={media.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {media.media_type === 'video' ? (
                        <Video className="h-4 w-4" />
                      ) : (
                        <Image className="h-4 w-4" />
                      )}
                      <span className="text-sm font-medium">{media.media_type}</span>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => deleteMediaItem(media.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  {media.media_type === 'image' && (
                    <img 
                      src={media.media_url} 
                      alt={media.title}
                      className="w-full h-32 object-cover rounded mb-2"
                    />
                  )}

                  <h3 className="font-medium text-sm mb-1">{media.title}</h3>
                  {media.description && (
                    <p className="text-xs text-gray-600 mb-2">{media.description}</p>
                  )}
                  
                  <div className="flex flex-wrap gap-1">
                    {media.category && (
                      <span className="text-xs bg-gray-100 px-2 py-1 rounded">{media.category}</span>
                    )}
                    {media.is_featured && (
                      <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">Mis en avant</span>
                    )}
                    {!media.is_published && (
                      <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">Non publié</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
