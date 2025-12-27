import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { YouTubeVideo } from "@/types/YouTubeVideo";
import YouTubeVideoForm from "./YouTubeVideoForm";
import { Pencil, Trash2, Plus, ExternalLink } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";

interface YouTubeVideoTableProps {
  videos: YouTubeVideo[];
  setVideos: (videos: YouTubeVideo[]) => void;
}

const YouTubeVideoTable = ({ videos, setVideos }: YouTubeVideoTableProps) => {
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingVideo, setEditingVideo] = useState<YouTubeVideo | undefined>();
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const refreshVideos = async () => {
    try {
      const { data, error } = await supabase
        .from("youtube_videos")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setVideos(data || []);
    } catch (error) {
      console.error("Error fetching YouTube videos:", error);
      toast.error("Erreur lors du chargement des vidéos");
    }
  };

  useEffect(() => {
    refreshVideos();
  }, []);

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
    setLoading(true);
    try {
      const { error } = await supabase
        .from("youtube_videos")
        .delete()
        .eq("id", id);

      if (error) throw error;
      toast.success("Vidéo supprimée");
      refreshVideos();
    } catch (error) {
      console.error("Error deleting YouTube video:", error);
      toast.error("Erreur lors de la suppression");
    } finally {
      setLoading(false);
      setDeleteId(null);
    }
  };

  const handleAddVideo = () => {
    setEditingVideo(undefined);
    setShowForm(true);
  };

  const handleEditVideo = (video: YouTubeVideo) => {
    setEditingVideo(video);
    setShowForm(true);
  };

  const togglePublished = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from("youtube_videos")
        .update({ is_published: !currentStatus })
        .eq("id", id);

      if (error) throw error;
      toast.success(currentStatus ? "Vidéo dépubliée" : "Vidéo publiée");
      refreshVideos();
    } catch (error) {
      console.error("Error updating video status:", error);
      toast.error("Erreur lors de la mise à jour");
    }
  };

  if (showForm) {
    return (
      <YouTubeVideoForm
        video={editingVideo}
        onSuccess={handleFormSuccess}
        onCancel={handleFormCancel}
      />
    );
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Vidéos YouTube</CardTitle>
          <Button onClick={handleAddVideo}>
            <Plus className="mr-2 h-4 w-4" />
            Ajouter une vidéo
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Miniature</TableHead>
                <TableHead>Titre</TableHead>
                <TableHead>Catégorie</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Featured</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {videos.map((video) => (
                <TableRow key={video.id}>
                  <TableCell>
                    <img
                      src={video.thumbnail_url}
                      alt={video.title}
                      className="w-24 h-14 object-cover rounded"
                    />
                  </TableCell>
                  <TableCell className="font-medium max-w-xs truncate">
                    {video.title}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {video.category || "YouTube"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={video.is_published ? "default" : "secondary"}>
                      {video.is_published ? "Publiée" : "Brouillon"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {video.is_featured && (
                      <Badge variant="destructive">Mise en avant</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {new Date(video.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => window.open(video.youtube_url, "_blank")}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => togglePublished(video.id, video.is_published)}
                    >
                      {video.is_published ? "Dépublier" : "Publier"}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditVideo(video)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDeleteId(video.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <AlertDialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer cette vidéo ? Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteId && handleDelete(deleteId)}
              disabled={loading}
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default YouTubeVideoTable;
