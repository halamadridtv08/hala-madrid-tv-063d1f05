import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  Clock, 
  ChevronRight,
  Flame,
  BookOpen
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { fr, enUS, es } from 'date-fns/locale';
import { stripHtml } from '@/utils/stripHtml';
import { useLanguage } from '@/contexts/LanguageContext';

interface TrendingArticle {
  id: string;
  title: string;
  category: string;
  published_at: string;
  image_url: string | null;
}

export const StickyContent = () => {
  const [trendingArticles, setTrendingArticles] = useState<TrendingArticle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { t, language } = useLanguage();
  
  const dateLocale = language === 'es' ? es : language === 'en' ? enUS : fr;

  useEffect(() => {
    const fetchTrending = async () => {
      try {
        // Fetch recent featured articles as "trending"
        const { data, error } = await supabase
          .from('articles')
          .select('id, title, category, published_at, image_url')
          .eq('is_published', true)
          .order('published_at', { ascending: false })
          .limit(5);

        if (error) throw error;
        setTrendingArticles(data || []);
      } catch (error) {
        console.error('Error fetching trending:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTrending();
  }, []);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="animate-pulse space-y-3">
            <div className="h-5 bg-muted rounded w-1/3" />
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-16 bg-muted rounded" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        {/* Header */}
        <div className="flex items-center gap-2 p-4 border-b bg-gradient-to-r from-destructive/10 to-secondary/10">
          <Flame className="w-5 h-5 text-destructive" />
          <h3 className="font-bold">{t('trending.title')}</h3>
          <Badge variant="secondary" className="ml-auto">
            <TrendingUp className="w-3 h-3 mr-1" />
            {t('trending.hot')}
          </Badge>
        </div>

        {/* Trending List */}
        <div className="divide-y">
          {trendingArticles.map((article, index) => (
            <Link 
              key={article.id} 
              to={`/article/${article.id}`}
              className="flex items-start gap-3 p-3 hover:bg-muted/50 transition-colors group"
            >
              <span className="text-2xl font-bold text-muted-foreground/30 group-hover:text-primary transition-colors">
                {index + 1}
              </span>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium line-clamp-2 group-hover:text-primary transition-colors">
                  {article.title}
                </h4>
                  <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                    <Badge variant="outline" className="text-xs px-1.5">
                      {article.category}
                    </Badge>
                    <span className="flex items-center">
                      <Clock className="w-3 h-3 mr-1" />
                      {format(new Date(article.published_at), 'dd MMM', { locale: dateLocale })}
                  </span>
                </div>
              </div>
              {article.image_url && (
                <img 
                  src={article.image_url} 
                  alt=""
                  className="w-16 h-12 object-cover rounded flex-shrink-0"
                  loading="lazy"
                />
              )}
            </Link>
          ))}
        </div>

        {/* CTA */}
        <div className="p-3 border-t bg-muted/30">
          <Link to="/news">
            <Button variant="ghost" size="sm" className="w-full">
              <BookOpen className="w-4 h-4 mr-2" />
              {t('trending.viewAll')}
              <ChevronRight className="w-4 h-4 ml-auto" />
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};
