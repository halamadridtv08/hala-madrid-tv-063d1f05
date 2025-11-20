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
import { Pencil, Trash2, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
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
import { FlashNewsFilters } from "./FlashNewsFilters";
import { FlashNewsVersionHistory } from "./FlashNewsVersionHistory";

interface FlashNewsTableProps {
  onEdit: (flashNews: any) => void;
  refresh?: boolean;
}

export const FlashNewsTable = ({ onEdit, refresh }: FlashNewsTableProps) => {
  const [flashNews, setFlashNews] = useState<any[]>([]);
  const [filteredFlashNews, setFilteredFlashNews] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    fetchFlashNews();
    fetchCategories();
  }, [refresh]);

  useEffect(() => {
    filterFlashNews();
  }, [flashNews, searchTerm, statusFilter, categoryFilter]);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('flash_news_categories')
        .select('slug, name')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const filterFlashNews = () => {
    let filtered = [...flashNews];

    if (searchTerm) {
      filtered = filtered.filter(
        (news) =>
          news.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
          news.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
          news.author_handle.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((news) => news.status === statusFilter);
    }

    if (categoryFilter !== "all") {
      filtered = filtered.filter((news) => news.category === categoryFilter);
    }

    setFilteredFlashNews(filtered);
  };

  const resetFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setCategoryFilter("all");
  };

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

  const handleApprove = async (newsId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('flash_news')
        .update({
          status: 'approved',
          approved_by: user.id,
          approved_at: new Date().toISOString(),
        })
        .eq('id', newsId);

      if (error) throw error;

      toast({
        title: "Info flash approuvée",
        description: "L'info flash a été approuvée avec succès.",
      });

      fetchFlashNews();
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
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

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      draft: { variant: "outline", label: "Brouillon" },
      pending: { variant: "secondary", label: "En attente" },
      approved: { variant: "default", label: "Approuvé" },
      published: { variant: "default", label: "Publié" },
    };
    return variants[status] || variants.draft;
  };

  const getApproverEmail = async (approverId: string) => {
    try {
      const { data } = await supabase.auth.admin.getUserById(approverId);
      return data?.user?.email || 'Inconnu';
    } catch (error) {
      return 'Inconnu';
    }
  };

  if (loading) {
    return <div>Chargement...</div>;
  }

  return (
    <>
      <FlashNewsFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        categoryFilter={categoryFilter}
        onCategoryChange={setCategoryFilter}
        onReset={resetFilters}
        categories={categories}
      />

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Auteur</TableHead>
            <TableHead>Contenu</TableHead>
            <TableHead>Catégorie</TableHead>
            <TableHead>Statut</TableHead>
            <TableHead>Approbation</TableHead>
            <TableHead>Publication</TableHead>
            <TableHead>Date</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredFlashNews.map((news) => {
            const categoryInfo = getCategoryBadge(news.category);
            const statusInfo = getStatusBadge(news.status);
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
                  <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
                </TableCell>
                <TableCell>
                  {news.approved_by && news.approved_at ? (
                    <div className="text-sm">
                      <div className="text-muted-foreground">
                        {new Date(news.approved_at).toLocaleDateString('fr-FR')} à{' '}
                        {new Date(news.approved_at).toLocaleTimeString('fr-FR', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                    </div>
                  ) : (
                    <span className="text-sm text-muted-foreground">—</span>
                  )}
                </TableCell>
                <TableCell>
                  {news.scheduled_at ? (
                    <div className="text-sm">
                      <div className="font-medium">Programmé</div>
                      <div className="text-muted-foreground">
                        {new Date(news.scheduled_at).toLocaleDateString('fr-FR')} à{' '}
                        {new Date(news.scheduled_at).toLocaleTimeString('fr-FR', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                    </div>
                  ) : (
                    <Badge variant={news.is_published ? "default" : "secondary"}>
                      {news.is_published ? "Publié" : "Brouillon"}
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {new Date(news.created_at).toLocaleDateString('fr-FR')}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <FlashNewsVersionHistory flashNewsId={news.id} />
                    {news.status === 'pending' && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleApprove(news.id)}
                        title="Approuver"
                      >
                        <CheckCircle className="h-4 w-4" />
                      </Button>
                    )}
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
