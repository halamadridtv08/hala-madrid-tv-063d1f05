
import { useState, useEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "lucide-react";

interface Article {
  id: string;
  title: string;
  description: string;
  image_url: string | null;
  category: string;
  published_at: string;
  read_time: string | null;
}

const News = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('articles')
        .select('*')
        .eq('is_published', true)
        .order('published_at', { ascending: false });
      
      if (error) throw error;
      setArticles(data || []);
    } catch (error) {
      console.error('Error fetching articles:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredNews = articles.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         article.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === null || article.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "match": return "bg-green-600";
      case "joueur": return "bg-blue-600";
      case "conférence": return "bg-purple-600";
      case "mercato": return "bg-orange-600";
      case "hommage": return "bg-red-600";
      case "formation": return "bg-teal-600";
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

  const categories = [
    { name: "Tous", value: null },
    { name: "Match", value: "match" },
    { name: "Joueur", value: "joueur" },
    { name: "Conférence", value: "conférence" },
    { name: "Mercato", value: "mercato" },
    { name: "Hommage", value: "hommage" },
    { name: "Formation", value: "formation" }
  ];

  return (
    <>
      <Navbar />
      <main className="min-h-screen">
        <div className="bg-madrid-blue py-10">
          <div className="madrid-container">
            <h1 className="text-4xl font-bold text-white mb-4">Actualités</h1>
          </div>
        </div>

        <div className="madrid-container py-8">
          <div className="flex flex-col md:flex-row gap-4 mb-8 justify-between">
            <Input
              placeholder="Rechercher une actualité..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
            
            <div className="flex flex-wrap gap-2">
              {categories.map(category => (
                <Badge
                  key={category.value ?? "all"}
                  className={`cursor-pointer ${
                    selectedCategory === category.value 
                    ? "bg-madrid-gold text-black" 
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                  }`}
                  onClick={() => setSelectedCategory(category.value)}
                >
                  {category.name}
                </Badge>
              ))}
            </div>
          </div>
          
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, index) => (
                <Card key={index} className="overflow-hidden">
                  <Skeleton className="h-48 w-full" />
                  <CardHeader>
                    <Skeleton className="h-4 w-20 mb-2" />
                    <Skeleton className="h-6 w-full mb-2" />
                    <Skeleton className="h-4 w-3/4" />
                  </CardHeader>
                  <CardFooter>
                    <Skeleton className="h-4 w-1/3" />
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredNews.map(article => (
                <Card key={article.id} className="overflow-hidden card-hover">
                  <div className="h-48 overflow-hidden">
                    <img 
                      src={article.image_url || "https://via.placeholder.com/400x200?text=Real+Madrid"} 
                      alt={article.title}
                      className="w-full h-full object-cover object-center"
                    />
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
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <User className="h-4 w-4" />
                      <span>Admin</span>
                    </div>
                    <Button asChild variant="link" className="p-0 text-madrid-blue dark:text-blue-400">
                      <Link to={`/news/${article.id}`}>Lire l'article</Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}

          {!loading && filteredNews.length === 0 && (
            <div className="text-center py-12">
              <h3 className="text-xl font-semibold mb-2">Aucune actualité trouvée</h3>
              <p className="text-gray-500">Essayez de modifier vos critères de recherche</p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
};

export default News;
