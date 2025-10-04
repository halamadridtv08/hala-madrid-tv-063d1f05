import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { VideoType } from '@/types/Video';

export function useVideos() {
  const [videos, setVideos] = useState<VideoType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('videos')
          .select('*')
          .eq('is_published', true)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setVideos(data || []);
      } catch (err) {
        console.error('Erreur lors du chargement des vidéos:', err);
        setError('Impossible de charger les vidéos');
      } finally {
        setIsLoading(false);
      }
    };

    fetchVideos();

    // Subscribe to realtime changes
    const channel = supabase
      .channel('videos-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'videos',
          filter: 'is_published=eq.true'
        },
        () => {
          fetchVideos();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return { videos, isLoading, error };
}
