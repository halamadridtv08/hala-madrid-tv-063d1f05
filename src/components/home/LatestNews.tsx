import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";
import { User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
interface Article {
  id: string;
  title: string;
  description: string;
  image_url: string | null;
  category: string;
  published_at: string;
  read_time: string | null;
}
export function LatestNews() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const fetchLatestNews = async () => {
      try {
        const {
          data,
          error
        } = await supabase.from('articles').select('*').eq('is_published', true).order('published_at', {
          ascending: false
        }).limit(6);
        if (error) throw error;
        setArticles(data || []);
      } catch (error) {
        console.error('Error fetching latest news:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchLatestNews();
  }, []);
  const getCategoryColor = (category: string) => {
    switch (category) {
      case "match":
        return "bg-green-600";
      case "joueur":
        return "bg-blue-600";
      case "conférence":
        return "bg-purple-600";
      case "mercato":
        return "bg-orange-600";
      case "hommage":
        return "bg-red-600";
      case "formation":
        return "bg-teal-600";
      default:
        return "bg-gray-600";
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
  return <section className="py-12">
      <div className="madrid-container">
        <div className="flex justify-between items-center mb-8">
          <h2 className="section-title">Dernières Actualités</h2>
          <Button asChild variant="outline">
            <Link to="/news">Voir toutes</Link>
          </Button>
        </div>
        
        {loading ? <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, index) => <Card key={index} className="overflow-hidden">
                <Skeleton className="h-48 w-full" />
                <CardHeader>
                  <Skeleton className="h-4 w-20 mb-2" />
                  <Skeleton className="h-6 w-full mb-2" />
                  <Skeleton className="h-4 w-3/4" />
                </CardHeader>
                <CardFooter>
                  <Skeleton className="h-4 w-1/3" />
                </CardFooter>
              </Card>)}
          </div> : <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map(article => <Card key={article.id} className="overflow-hidden card-hover">
                <div className="relative h-48 overflow-hidden">
                  <img src={article.image_url || "https://via.placeholder.com/400x200?text=Real+Madrid"} alt={article.title} className="w-full h-full object-cover object-center transition-transform duration-500 hover:scale-105" />
                  {article.read_time && <div className="absolute top-2 right-2">
                      <Badge className="bg-white text-gray-800 font-medium">
                        {article.read_time} de lecture
                      </Badge>
                    </div>}
                </div>
                <CardHeader>
                  <div className="flex justify-between items-start mb-2">
                    <Badge className={`${getCategoryColor(article.category)} text-white`}>
                      {article.category.charAt(0).toUpperCase() + article.category.slice(1)}
                    </Badge>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {formatDate(article.published_at)}
                    </span>
                  </div>
                  <CardTitle className="line-clamp-2">{article.title}</CardTitle>
                  <CardDescription className="line-clamp-2">{article.description}</CardDescription>
                </CardHeader>
                <CardFooter className="flex justify-between items-center">
                  
                  <Button asChild variant="link" className="p-0 text-madrid-blue dark:text-blue-400">
                    <Link to={`/news/${article.id}`}>Lire l'article</Link>
                  </Button>
                </CardFooter>
              </Card>)}
          </div>}
        
        {!loading && articles.length === 0 && <div className="text-center py-8">
            <h3 className="text-xl font-semibold mb-2">Aucun article publié</h3>
            <p className="text-gray-500 mb-4">Les articles apparaîtront ici une fois publiés</p>
            <Button asChild>
              <Link to="/admin">Créer un article</Link>
            </Button>
          </div>}
      </div>
    </section>;
}