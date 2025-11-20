import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
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

interface FlashNewsTableProps {
  onEdit: (flashNews: any) => void;
  refresh?: boolean;
}

export const FlashNewsTable = ({ onEdit, refresh }: FlashNewsTableProps) => {
  const [flashNews, setFlashNews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchFlashNews();
  }, [refresh]);

  const fetchFlashNews = async () => {
    try {
      const { data, error } = await supabase
        .from('flash_news')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setFlashNews(data || []);
    } catch (error) {
      console.error('Error fetching flash news:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      const { error } = await supabase
        .from('flash_news')
        .delete()
        .eq('id', deleteId);

      if (error) throw error;

      toast({
        title: "Info flash supprimée",
        description: "L'info flash a été supprimée avec succès.",
      });

      fetchFlashNews();
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setDeleteId(null);
    }
  };

  const getCategoryBadge = (category: string) => {
    const variants: Record<string, any> = {
      transfer: { variant: "default", label: "Transfert" },
      injury: { variant: "destructive", label: "Blessure" },
      match: { variant: "secondary", label: "Match" },
      general: { variant: "outline", label: "Général" },
    };
    return variants[category] || variants.general;
  };

  if (loading) {
    return <div>Chargement...</div>;
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Auteur</TableHead>
            <TableHead>Contenu</TableHead>
            <TableHead>Catégorie</TableHead>
            <TableHead>Statut</TableHead>
            <TableHead>Date</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {flashNews.map((news) => {
            const categoryInfo = getCategoryBadge(news.category);
            return (
              <TableRow key={news.id}>
                <TableCell>
                  <div>
                    <div className="font-medium">{news.author}</div>
                    <div className="text-sm text-muted-foreground">{news.author_handle}</div>
                  </div>
                </TableCell>
                <TableCell className="max-w-md truncate">{news.content}</TableCell>
                <TableCell>
                  <Badge variant={categoryInfo.variant}>{categoryInfo.label}</Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={news.is_published ? "default" : "secondary"}>
                    {news.is_published ? "Publié" : "Brouillon"}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {new Date(news.created_at).toLocaleDateString('fr-FR')}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onEdit(news)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setDeleteId(news.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer cette info flash ? Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Supprimer</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
