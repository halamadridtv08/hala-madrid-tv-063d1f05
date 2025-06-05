
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { VideoType } from "@/types/Video";
import { Plus, Edit, Trash2, Play } from "lucide-react";
import { toast } from "sonner";
import { VideoForm } from "./VideoForm";

interface VideoTableProps {
  videos: VideoType[];
  setVideos: (videos: VideoType[]) => void;
}

const VideoTable = ({ videos, setVideos }: VideoTableProps) => {
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingVideo, setEditingVideo] = useState<VideoType | undefined>();

  const refreshVideos = async () => {
    const { data, error } = await supabase
      .from('videos')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erreur lors du rechargement:', error);
    } else {
      setVideos(data || []);
    }
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingVideo(undefined);
    refreshVideos();
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingVideo(undefined);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette vidéo ?")) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('videos')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setVideos(videos.filter(video => video.id !== id));
      toast.success("Vidéo supprimée avec succès");
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      toast.error("Erreur lors de la suppression de la vidéo");
    } finally {
      setLoading(false);
    }
  };

  const togglePublished = async (id: string, currentStatus: boolean) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('videos')
        .update({ is_published: !currentStatus })
        .eq('id', id);

      if (error) throw error;

      setVideos(videos.map(video => 
        video.id === id 
          ? { ...video, is_published: !currentStatus }
          : video
      ));
      toast.success("Statut de publication mis à jour");
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
      toast.error("Erreur lors de la mise à jour du statut");
    } finally {
      setLoading(false);
    }
  };

  const handleAddVideo = () => {
    setEditingVideo(undefined);
    setShowForm(true);
  };

  const handleEditVideo = (video: VideoType) => {
    setEditingVideo(video);
    setShowForm(true);
  };

  if (showForm) {
    return (
      <VideoForm
        video={editingVideo}
        onSuccess={handleFormSuccess}
        onCancel={handleFormCancel}
      />
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Vidéos ({videos.length})</CardTitle>
          <Button onClick={handleAddVideo}>
            <Plus className="h-4 w-4 mr-2" />
            Nouvelle vidéo
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {videos.map((video) => (
            <div key={video.id} className="flex items-center justify-between p-4 border rounded">
              <div className="flex-1">
                <h3 className="font-semibold">{video.title}</h3>
                <p className="text-sm text-gray-600 mt-1">{video.description}</p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant={video.is_published ? "default" : "secondary"}>
                    {video.is_published ? "Publié" : "Brouillon"}
                  </Badge>
                  {video.category && <Badge variant="outline">{video.category}</Badge>}
                  {video.duration && (
                    <span className="text-xs text-gray-500">{video.duration}s</span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => togglePublished(video.id, video.is_published)}
                  disabled={loading}
                  title={video.is_published ? "Dépublier" : "Publier"}
                >
                  <Play className="h-4 w-4" />
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleEditVideo(video)}
                  title="Modifier la vidéo"
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete(video.id)}
                  disabled={loading}
                  title="Supprimer la vidéo"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
          {videos.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              Aucune vidéo trouvée
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default VideoTable;
