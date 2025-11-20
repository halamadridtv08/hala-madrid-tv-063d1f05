import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { FlashNews } from '@/types/FlashNews';

export const useFlashNews = () => {
  const [flashNews, setFlashNews] = useState<FlashNews[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFlashNews();

    const channel = supabase
      .channel('flash-news-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
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
      const { data, error } = await supabase
        .from('flash_news')
        .select('*')
        .eq('is_published', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setFlashNews((data || []) as FlashNews[]);
    } catch (error) {
      console.error('Error fetching flash news:', error);
    } finally {
      setLoading(false);
    }
  };

  return { flashNews, loading };
};
