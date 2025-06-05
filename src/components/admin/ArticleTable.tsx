
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { Article } from "@/types/Article";
import { Plus, Edit, Trash2, Eye } from "lucide-react";
import { toast } from "sonner";

interface ArticleTableProps {
  articles: Article[];
  setArticles: (articles: Article[]) => void;
}

const ArticleTable = ({ articles, setArticles }: ArticleTableProps) => {
  const [loading, setLoading] = useState(false);

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
    toast.info("Formulaire d'ajout d'article - À implémenter");
    console.log("Redirection vers le formulaire d'ajout d'article");
  };

  const handleEditArticle = (article: Article) => {
    toast.info(`Modification de "${article.title}" - À implémenter`);
    console.log("Redirection vers le formulaire de modification:", article);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Articles ({articles.length})</CardTitle>
          <Button onClick={handleAddArticle}>
            <Plus className="h-4 w-4 mr-2" />
            Nouvel article
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {articles.map((article) => (
            <div key={article.id} className="flex items-center justify-between p-4 border rounded">
              <div className="flex-1">
                <h3 className="font-semibold">{article.title}</h3>
                <p className="text-sm text-gray-600 mt-1">{article.description}</p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant={article.is_published ? "default" : "secondary"}>
                    {article.is_published ? "Publié" : "Brouillon"}
                  </Badge>
                  <Badge variant="outline">{article.category}</Badge>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => togglePublished(article.id, article.is_published)}
                  disabled={loading}
                  title={article.is_published ? "Dépublier" : "Publier"}
                >
                  <Eye className="h-4 w-4" />
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleEditArticle(article)}
                  title="Modifier l'article"
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete(article.id)}
                  disabled={loading}
                  title="Supprimer l'article"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
          {articles.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              Aucun article trouvé
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ArticleTable;
