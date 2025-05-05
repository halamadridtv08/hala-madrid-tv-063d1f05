
import { useState } from "react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { MoreHorizontal, Plus, Eye, Pencil, Trash2 } from "lucide-react";

interface Article {
  id: string;
  title: string;
  description: string;
  content: string;
  image_url: string | null;
  category: string;
  published_at: string;
  is_published: boolean;
  read_time: string | null;
  featured: boolean;
}

interface ArticleListProps {
  articles: Article[];
  loading: boolean;
  onNewArticle: () => void;
  onEditArticle: (article: Article) => void;
  refetchArticles: () => void;
}

export const ArticleList = ({ 
  articles, 
  loading, 
  onNewArticle, 
  onEditArticle,
  refetchArticles 
}: ArticleListProps) => {
  const { toast } = useToast();
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer cet article ?")) return;
    
    try {
      const { error } = await supabase
        .from('articles')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      toast({
        title: "Article supprimé",
        description: "L'article a été supprimé avec succès"
      });
      
      refetchArticles();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: error.message || "Une erreur est survenue lors de la suppression"
      });
    }
  };

  const togglePublishStatus = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('articles')
        .update({ is_published: !currentStatus })
        .eq('id', id);
      
      if (error) throw error;
      
      toast({
        title: currentStatus ? "Article dépublié" : "Article publié",
        description: currentStatus 
          ? "L'article a été dépublié avec succès" 
          : "L'article a été publié avec succès"
      });
      
      refetchArticles();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: error.message || "Une erreur est survenue"
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Gérer les articles</CardTitle>
          <Button onClick={onNewArticle}>
            <Plus className="mr-2 h-4 w-4" />
            Nouvel article
          </Button>
        </div>
        <CardDescription>
          Liste de tous vos articles. Vous pouvez les modifier, les supprimer ou changer leur statut de publication.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Titre</TableHead>
              <TableHead>Catégorie</TableHead>
              <TableHead>Date de publication</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {articles.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  {loading ? "Chargement des articles..." : "Aucun article trouvé"}
                </TableCell>
              </TableRow>
            )}
            {articles.map((article) => (
              <TableRow key={article.id}>
                <TableCell className="font-medium">{article.title}</TableCell>
                <TableCell>
                  <Badge className="capitalize">
                    {article.category}
                  </Badge>
                </TableCell>
                <TableCell>{formatDate(article.published_at)}</TableCell>
                <TableCell>
                  <Badge variant={article.is_published ? "default" : "outline"}>
                    {article.is_published ? "Publié" : "Brouillon"}
                  </Badge>
                  {article.featured && (
                    <Badge variant="secondary" className="ml-2">
                      À la une
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Actions</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem 
                        onClick={() => togglePublishStatus(article.id, article.is_published)}
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        {article.is_published ? "Dépublier" : "Publier"}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => onEditArticle(article)}
                      >
                        <Pencil className="mr-2 h-4 w-4" />
                        Modifier
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => handleDelete(article.id)}
                        className="text-red-600 focus:text-red-600"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Supprimer
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
