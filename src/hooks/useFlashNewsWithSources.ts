import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { FlashNews } from '@/types/FlashNews';
import { FlashNewsSource } from '@/types/FlashNewsSource';
import { toast } from 'sonner';

export interface FlashNewsWithSource extends FlashNews {
  source?: FlashNewsSource | null;
}

export const useFlashNewsWithSources = () => {
  const [flashNews, setFlashNews] = useState<FlashNewsWithSource[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFlashNews();

    const channel = supabase
      .channel('flash-news-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'flash_news'
        },
        (payload) => {
          const newFlashNews = payload.new as FlashNews;
          if (newFlashNews.is_published) {
            toast.success('Nouvelle info flash !', {
              description: `${newFlashNews.author}: ${newFlashNews.content.substring(0, 50)}...`,
              duration: 5000,
            });
            fetchFlashNews();
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'flash_news'
        },
        () => {
          fetchFlashNews();
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'flash_news'
        },
        () => {
          fetchFlashNews();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchFlashNews = async () => {
    try {
      // Fetch flash news
      const { data: newsData, error: newsError } = await supabase
        .from('flash_news')
        .select('*')
        .eq('is_published', true)
        .eq('status', 'published')
        .order('created_at', { ascending: false });

      if (newsError) throw newsError;

      // Fetch all sources
      const { data: sourcesData, error: sourcesError } = await supabase
        .from('flash_news_sources')
        .select('*')
        .eq('is_active', true);

      if (sourcesError) throw sourcesError;

      // Map sources by handle for quick lookup
      const sourcesMap = new Map<string, FlashNewsSource>();
      sourcesData?.forEach(source => {
        sourcesMap.set(source.handle, source);
      });

      // Merge flash news with their sources
      const newsWithSources: FlashNewsWithSource[] = (newsData || []).map(news => ({
        ...(news as FlashNews),
        source: sourcesMap.get(news.author_handle) || null,
      }));

      setFlashNews(newsWithSources);
    } catch (error) {
      console.error('Error fetching flash news:', error);
    } finally {
      setLoading(false);
    }
  };

  return { flashNews, loading };
};
