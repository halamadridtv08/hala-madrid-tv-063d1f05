
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { User, Calendar } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Article {
  id: string;
  title: string;
  description: string;
  content: string;
  image_url: string | null;
  category: string;
  published_at: string;
  read_time: string | null;
}

const ArticleDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  
  useEffect(() => {
    const fetchArticle = async () => {
      try {
        if (!id) return;
        
        const { data, error } = await supabase
          .from('articles')
          .select('*')
          .eq('id', id)
          .single();
        
        if (error) throw error;
        setArticle(data);
      } catch (error: any) {
        console.error('Error fetching article:', error);
        toast({
          variant: "destructive",
          title: "Article non trouvé",
          description: "L'article demandé n'existe pas ou n'est pas disponible"
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchArticle();
  }, [id, toast]);

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "match": return "bg-green-600";
      case "joueur": return "bg-blue-600";
      case "conférence": return "bg-purple-600";
      case "mercato": return "bg-orange-600";
      case "hommage": return "bg-red-600";
      case "formation": return "bg-teal-600";
      case "info": return "bg-yellow-600";
      default: return "bg-gray-600";
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).format(date);
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <main>
          <div className="madrid-container py-8">
            <Skeleton className="h-10 w-3/4 mb-4" />
            <Skeleton className="h-6 w-1/2 mb-8" />
            <Skeleton className="h-[400px] w-full mb-8" />
            <Skeleton className="h-6 w-full mb-4" />
            <Skeleton className="h-6 w-full mb-4" />
            <Skeleton className="h-6 w-3/4 mb-8" />
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (!article) {
    return (
      <>
        <Navbar />
        <main>
          <div className="madrid-container py-20 text-center">
            <h1 className="text-3xl font-bold mb-4">Article non trouvé</h1>
            <p className="text-gray-500 mb-8">L'article que vous recherchez n'existe pas ou a été supprimé.</p>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  // Fonction pour rendre en toute sécurité le contenu HTML
  const renderContent = () => {
    // Fonction pour convertir les sauts de ligne en paragraphes, tout en conservant les balises HTML
    const formatContent = (content: string) => {
      // Si le contenu contient déjà des balises HTML (comme des vidéos ou des images), ne pas les modifier
      if (content.includes('<video') || content.includes('<img')) {
        return { __html: content };
      }
      
      // Sinon, convertir les sauts de ligne en paragraphes
      return {
        __html: content
          .split('\n')
          .filter(paragraph => paragraph.trim() !== '')
          .map(paragraph => `<p>${paragraph}</p>`)
          .join('')
      };
    };
    
    return <div dangerouslySetInnerHTML={formatContent(article.content)} />;
  };

  return (
    <>
      <Navbar />
      <main>
        <div className="madrid-container py-8">
          <div className="mb-8">
            <Badge className={`${getCategoryColor(article.category)} mb-4`}>
              {article.category.charAt(0).toUpperCase() + article.category.slice(1)}
            </Badge>
            <h1 className="text-4xl font-bold mb-4">{article.title}</h1>
            <p className="text-xl text-gray-500 dark:text-gray-400 mb-4">{article.description}</p>
            
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-6">
              <div className="flex items-center">
                <User className="h-4 w-4 mr-1" />
                <span>Administrateur</span>
              </div>
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-1" />
                <span>{formatDate(article.published_at)}</span>
              </div>
              {article.read_time && (
                <div className="flex items-center">
                  <span>{article.read_time} de lecture</span>
                </div>
              )}
            </div>
          </div>
          
          {article.image_url && (
            <div className="mb-8">
              <img 
                src={article.image_url} 
                alt={article.title}
                className="w-full h-auto max-h-[500px] object-cover object-center rounded-lg"
              />
            </div>
          )}
          
          <Card className="mb-8">
            <CardContent className="p-6 sm:p-8">
              <div className="prose dark:prose-invert max-w-none">
                {renderContent()}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default ArticleDetail;
