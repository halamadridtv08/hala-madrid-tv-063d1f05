import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { Zap, ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface Article {
  id: string;
  title: string;
  category: string;
  published_at: string;
}

export const LatestNewsWidget = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLatestNews = async () => {
      try {
        const { data, error } = await supabase
          .from("articles")
          .select("id, title, category, published_at")
          .eq("is_published", true)
          .order("published_at", { ascending: false })
          .limit(10);

        if (error) throw error;
        setArticles(data || []);
      } catch (error) {
        console.error("Erreur lors du chargement des actualités:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLatestNews();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.toLocaleDateString("fr-FR", { month: "short" }).toUpperCase();
    const time = date.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
    return `${day} ${month}, ${time}`;
  };

  if (loading) {
    return (
      <Card className="bg-gradient-to-br from-blue-600 to-blue-800 text-white p-6 sticky top-24">
        <div className="flex items-center gap-2 mb-6">
          <Zap className="h-5 w-5" />
          <h2 className="text-xl font-bold">DERNIÈRES INFOS</h2>
        </div>
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-full bg-blue-700/50" />
              <Skeleton className="h-6 w-full bg-blue-700/50" />
            </div>
          ))}
        </div>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-blue-600 to-blue-800 text-white p-6 sticky top-24 max-h-[600px] overflow-hidden flex flex-col">
      <div className="flex items-center gap-2 mb-6">
        <Zap className="h-5 w-5" />
        <h2 className="text-xl font-bold">DERNIÈRES INFOS</h2>
      </div>
      
      <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
        {articles.map((article) => (
          <Link
            key={article.id}
            to={`/news/${article.id}`}
            className="block border-b border-blue-400/30 pb-4 last:border-b-0 hover:bg-white/5 transition-colors rounded-lg px-3 py-2 -mx-3"
          >
            <div className="text-xs text-blue-200 mb-1 uppercase">
              {article.category} • {formatDate(article.published_at)}
            </div>
            <h3 className="font-bold text-sm leading-tight line-clamp-2">
              {article.title}
            </h3>
          </Link>
        ))}
      </div>

      <Link
        to="/news"
        className="mt-6 flex items-center justify-center gap-2 text-sm font-medium hover:text-blue-200 transition-colors border-t border-blue-400/30 pt-4"
      >
        Voir toutes les actualités
        <ArrowRight className="h-4 w-4" />
      </Link>
    </Card>
  );
};
