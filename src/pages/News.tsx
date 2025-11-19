
import { useState, useEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { LatestNewsWidget } from "@/components/home/LatestNewsWidget";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User, ExternalLink } from "lucide-react";

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

  const categories = [
    { name: "Tous", value: null },
    { name: "Match", value: "match" },
    { name: "Joueur", value: "joueur" },
    { name: "Conférence", value: "conférence" },
    { name: "Mercato", value: "mercato" },
    { name: "Hommage", value: "hommage" },
    { name: "Formation", value: "formation" },
    { name: "Info", value: "info" }
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
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Contenu principal */}
            <div className="lg:col-span-2">
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
...
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
...
                </div>
              )}

              {filteredNews.length === 0 && !loading && (
                <div className="text-center py-12">
                  <p className="text-gray-600 dark:text-gray-400 text-lg">Aucun article trouvé.</p>
                </div>
              )}
            </div>

            {/* Widget des dernières infos */}
            <div className="lg:col-span-1">
              <LatestNewsWidget />
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default News;
