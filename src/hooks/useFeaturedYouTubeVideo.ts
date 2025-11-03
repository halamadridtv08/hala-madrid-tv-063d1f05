import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { YouTubeVideo } from '@/types/YouTubeVideo';

export const useFeaturedYouTubeVideo = () => {
  const [video, setVideo] = useState<YouTubeVideo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeaturedVideo();

    const channel = supabase
      .channel('featured-youtube-video-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'youtube_videos'
        },
        () => {
          fetchFeaturedVideo();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchFeaturedVideo = async () => {
    try {
      const { data, error } = await supabase
        .from('youtube_videos')
        .select('*')
        .eq('is_published', true)
        .eq('is_featured', true)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }
      
      setVideo(data || null);
    } catch (error) {
      console.error('Error fetching featured YouTube video:', error);
      setVideo(null);
    } finally {
      setLoading(false);
    }
  };

  return { video, loading };
};
