import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { TrendingUp, Clock } from "lucide-react";

interface Article {
  id: string;
  title: string;
  description: string;
  image_url?: string;
  category: string;
  published_at: string;
  read_time?: string;
}

interface RelatedArticlesProps {
  currentArticleId: string;
  category: string;
}

export const RelatedArticles = ({ currentArticleId, category }: RelatedArticlesProps) => {
  const [articles, setArticles] = useState<Article[]>([]);

  useEffect(() => {
    fetchRelatedArticles();
  }, [currentArticleId, category]);

  const fetchRelatedArticles = async () => {
    const { data, error } = await supabase
      .from("articles")
      .select("id, title, description, image_url, category, published_at, read_time")
      .eq("is_published", true)
      .eq("category", category)
      .neq("id", currentArticleId)
      .order("published_at", { ascending: false })
      .limit(6);

    if (!error && data) {
      setArticles(data);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("fr-FR", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(date);
  };

  if (articles.length === 0) return null;

  return (
    <div className="mt-12">
      <h3 className="text-3xl font-bold mb-8 flex items-center gap-2">
        <TrendingUp className="w-8 h-8" />
        Les Plus Lus
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {articles.map((article) => (
          <Card key={article.id} className="overflow-hidden hover:shadow-lg transition-shadow">
            <Link to={`/news/${article.id}`}>
              {article.image_url && (
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={article.image_url}
                    alt={article.title}
                    className="w-full h-full object-cover transition-transform hover:scale-105"
                  />
                  <div className="absolute top-3 left-3">
                    <span className="px-3 py-1 bg-primary text-primary-foreground text-xs font-semibold rounded-full">
                      {article.category}
                    </span>
                  </div>
                </div>
              )}
              <div className="p-4">
                <div className="flex items-center gap-3 text-sm text-muted-foreground mb-2">
                  <span>{formatDate(article.published_at)}</span>
                  {article.read_time && (
                    <>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {article.read_time}
                      </span>
                    </>
                  )}
                </div>
                <h4 className="font-bold text-lg mb-2 line-clamp-2 hover:text-primary transition-colors">
                  {article.title}
                </h4>
                <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                  {article.description}
                </p>
                <Button variant="outline" size="sm" className="w-full">
                  Lire l'article
                </Button>
              </div>
            </Link>
          </Card>
        ))}
      </div>
    </div>
  );
};
