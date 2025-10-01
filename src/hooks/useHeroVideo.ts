import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

// Configuration centralisée : changez simplement le nom du fichier ici
const HERO_VIDEO_FILENAME = 'iPhone-mockups.mp4_1750270490323.mp4';
const BUCKET_NAME = 'media';

export function useHeroVideo() {
  const [videoUrl, setVideoUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadVideo = async () => {
      try {
        const { data } = supabase.storage
          .from(BUCKET_NAME)
          .getPublicUrl(HERO_VIDEO_FILENAME);
        
        if (data?.publicUrl) {
          setVideoUrl(data.publicUrl);
        }
      } catch (error) {
        console.error('Erreur lors du chargement de la vidéo:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadVideo();
  }, []);

  return { videoUrl, isLoading };
}
