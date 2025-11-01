import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Article } from "@/types/Article";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash2, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ArticleForm } from "./ArticleForm";
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

export const SpecialArticlesManager = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchSpecialArticles();
  }, []);

  const fetchSpecialArticles = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("articles")
        .select("*")
        .eq("category", "special")
        .order("published_at", { ascending: false });

      if (error) throw error;
      setArticles(data || []);
    } catch (error) {
      console.error("Error fetching special articles:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les articles spéciaux",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      const { error } = await supabase
        .from("articles")
        .delete()
        .eq("id", deleteId);

      if (error) throw error;

      toast({
        title: "Succès",
        description: "Article supprimé avec succès",
      });
      fetchSpecialArticles();
    } catch (error) {
      console.error("Error deleting article:", error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer l'article",
        variant: "destructive",
      });
    } finally {
      setDeleteId(null);
    }
  };

  const togglePublished = async (article: Article) => {
    try {
      const { error } = await supabase
        .from("articles")
        .update({ is_published: !article.is_published })
        .eq("id", article.id);

      if (error) throw error;

      toast({
        title: "Succès",
        description: `Article ${!article.is_published ? "publié" : "dépublié"}`,
      });
      fetchSpecialArticles();
    } catch (error) {
      console.error("Error toggling published:", error);
      toast({
        title: "Erreur",
        description: "Impossible de modifier le statut",
        variant: "destructive",
      });
    }
  };

  const handleSuccess = () => {
    setShowForm(false);
    setEditingArticle(null);
    fetchSpecialArticles();
  };

  if (showForm) {
    return (
      <ArticleForm
        article={editingArticle || undefined}
        onSuccess={handleSuccess}
        onCancel={() => {
          setShowForm(false);
          setEditingArticle(null);
        }}
        defaultCategory="special"
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold">Articles Spéciaux</h2>
          <p className="text-muted-foreground mt-2">
            Gérez les articles de la section "Trophées & Moments Légendaires"
          </p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Nouvel Article Spécial
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Chargement...</p>
        </div>
      ) : articles.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">
              Aucun article spécial. Créez-en un pour commencer !
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {articles.map((article) => (
            <Card key={article.id} className="overflow-hidden group">
              <div className="relative h-48 overflow-hidden">
                {article.image_url ? (
                  <img
                    src={article.image_url}
                    alt={article.title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                ) : (
                  <div className="w-full h-full bg-muted flex items-center justify-center">
                    <p className="text-muted-foreground">Pas d'image</p>
                  </div>
                )}
                <div className="absolute top-2 right-2 flex gap-2">
                  <Button
                    size="icon"
                    variant={article.is_published ? "default" : "secondary"}
                    onClick={() => togglePublished(article)}
                    className="h-8 w-8"
                  >
                    {article.is_published ? (
                      <Eye className="h-4 w-4" />
                    ) : (
                      <EyeOff className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
              <CardHeader>
                <CardTitle className="line-clamp-2">{article.title}</CardTitle>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {article.description}
                </p>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => {
                      setEditingArticle(article);
                      setShowForm(true);
                    }}
                  >
                    <Pencil className="mr-2 h-4 w-4" />
                    Modifier
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => setDeleteId(article.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer cet article ? Cette action est
              irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
