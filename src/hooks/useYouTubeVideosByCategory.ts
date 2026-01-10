import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { YouTubeVideo } from '@/types/YouTubeVideo';

export const useYouTubeVideosByCategory = (category: string) => {
  const [videos, setVideos] = useState<YouTubeVideo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVideos();

    const channel = supabase
      .channel(`youtube-videos-${category}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'youtube_videos'
        },
        () => {
          fetchVideos();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [category]);

  const fetchVideos = async () => {
    try {
      const { data, error } = await supabase
        .from('youtube_videos')
        .select('*')
        .eq('is_published', true)
        .eq('category', category)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setVideos(data || []);
    } catch (error) {
      console.error(`Error fetching YouTube videos for category ${category}:`, error);
    } finally {
      setLoading(false);
    }
  };

  return { videos, loading };
};
