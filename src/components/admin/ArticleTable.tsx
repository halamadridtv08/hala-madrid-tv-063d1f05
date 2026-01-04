
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
      <CardHeader className="px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <CardTitle className="text-base sm:text-lg">Articles ({sortedArticles.length})</CardTitle>
          <Button onClick={handleAddArticle} size="sm" className="h-8 sm:h-9">
            <Plus className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Nouvel article</span>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="px-3 sm:px-6">
        <div className="grid gap-3 sm:gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {sortedArticles.map((article) => (
            <Card key={article.id} className="overflow-hidden group">
              <div className="relative h-32 sm:h-40 md:h-48 overflow-hidden">
                {article.image_url ? (
                  <img
                    src={article.image_url}
                    alt={article.title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                ) : (
                  <div className="w-full h-full bg-muted flex items-center justify-center">
                    <p className="text-muted-foreground text-sm">Pas d'image</p>
                  </div>
                )}
                <div className="absolute top-2 right-2">
                  <Button
                    size="icon"
                    variant={article.is_published ? "default" : "secondary"}
                    onClick={() => togglePublished(article.id, article.is_published)}
                    disabled={loading}
                    className="h-7 w-7 sm:h-8 sm:w-8"
                    title={article.is_published ? "Dépublier" : "Publier"}
                  >
                    <Eye className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  </Button>
                </div>
              </div>
              <CardHeader className="p-3 sm:pb-2">
                <CardTitle className="line-clamp-2 text-sm sm:text-base">{article.title}</CardTitle>
                <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2">
                  {stripHtml(article.description)}
                </p>
                <div className="flex items-center gap-1.5 sm:gap-2 mt-2 flex-wrap">
                  <Badge variant={article.is_published ? "default" : "secondary"} className="text-[10px] sm:text-xs">
                    {article.is_published ? "Publié" : "Brouillon"}
                  </Badge>
                  <Badge variant="outline" className="text-[10px] sm:text-xs">{article.category}</Badge>
                </div>
              </CardHeader>
              <CardContent className="p-3 pt-0">
                <div className="flex gap-1.5 sm:gap-2">
                  {onManageEngagement && (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => onManageEngagement(article.id)}
                      title="Gérer engagement"
                      className="h-7 w-7 sm:h-8 sm:w-8 p-0"
                    >
                      <MessageCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 h-7 sm:h-8 text-xs sm:text-sm"
                    onClick={() => handleEditArticle(article)}
                  >
                    <Edit className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="hidden xs:inline">Modifier</span>
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(article.id)}
                    disabled={loading}
                    className="h-7 w-7 sm:h-8 sm:w-8 p-0"
                  >
                    <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
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
