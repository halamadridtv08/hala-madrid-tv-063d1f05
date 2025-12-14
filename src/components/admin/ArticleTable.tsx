
import React, { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { Article } from "@/types/Article";
import { Plus, Edit, Trash2, Eye, MessageCircle } from "lucide-react";
import { toast } from "sonner";
import { ArticleForm } from "./ArticleForm";
import { stripHtml } from "@/utils/stripHtml";

interface ArticleTableProps {
  articles: Article[];
  setArticles: (articles: Article[]) => void;
  onManageEngagement?: (articleId: string) => void;
}

const ArticleTable = ({ articles, setArticles, onManageEngagement }: ArticleTableProps) => {
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingArticle, setEditingArticle] = useState<Article | undefined>();

  // Trier les articles par date de publication (plus récent en premier)
  const sortedArticles = useMemo(() => {
    return [...articles].sort((a, b) => {
      const dateA = new Date(a.published_at || 0).getTime();
      const dateB = new Date(b.published_at || 0).getTime();
      return dateB - dateA;
    });
  }, [articles]);

  const refreshArticles = async () => {
    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .order('published_at', { ascending: false });

    if (error) {
      console.error('Erreur lors du rechargement:', error);
    } else {
      setArticles(data || []);
    }
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingArticle(undefined);
    refreshArticles();
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingArticle(undefined);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cet article ?")) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('articles')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setArticles(articles.filter(article => article.id !== id));
      toast.success("Article supprimé avec succès");
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      toast.error("Erreur lors de la suppression de l'article");
    } finally {
      setLoading(false);
    }
  };

  const togglePublished = async (id: string, currentStatus: boolean) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('articles')
        .update({ is_published: !currentStatus })
        .eq('id', id);

      if (error) throw error;

      setArticles(articles.map(article => 
        article.id === id 
          ? { ...article, is_published: !currentStatus }
          : article
      ));
      toast.success("Statut de publication mis à jour");
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
      toast.error("Erreur lors de la mise à jour du statut");
    } finally {
      setLoading(false);
    }
  };

  const handleAddArticle = () => {
    setEditingArticle(undefined);
    setShowForm(true);
  };

  const handleEditArticle = (article: Article) => {
    setEditingArticle(article);
    setShowForm(true);
  };

  if (showForm) {
    return (
      <ArticleForm
        article={editingArticle}
        onSuccess={handleFormSuccess}
        onCancel={handleFormCancel}
      />
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Articles ({sortedArticles.length})</CardTitle>
          <Button onClick={handleAddArticle}>
            <Plus className="h-4 w-4 mr-2" />
            Nouvel article
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {sortedArticles.map((article) => (
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
                    onClick={() => togglePublished(article.id, article.is_published)}
                    disabled={loading}
                    className="h-8 w-8"
                    title={article.is_published ? "Dépublier" : "Publier"}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <CardHeader className="pb-2">
                <CardTitle className="line-clamp-2 text-base">{article.title}</CardTitle>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {stripHtml(article.description)}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant={article.is_published ? "default" : "secondary"}>
                    {article.is_published ? "Publié" : "Brouillon"}
                  </Badge>
                  <Badge variant="outline">{article.category}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  {onManageEngagement && (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => onManageEngagement(article.id)}
                      title="Gérer engagement"
                    >
                      <MessageCircle className="h-4 w-4" />
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleEditArticle(article)}
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    Modifier
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(article.id)}
                    disabled={loading}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        {sortedArticles.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            Aucun article trouvé
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ArticleTable;
