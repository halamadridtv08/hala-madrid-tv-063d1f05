import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface UnifiedVideo {
  id: string;
  title: string;
  description?: string;
  video_url: string;
  thumbnail_url?: string;
  category: string;
  source: 'video' | 'training' | 'press' | 'youtube';
  duration?: number;
  created_at: string;
  is_short?: boolean;
}

export function useAllVideos() {
  const [videos, setVideos] = useState<UnifiedVideo[]>([]);
  const [shorts, setShorts] = useState<UnifiedVideo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAllVideos = async () => {
      try {
        setIsLoading(true);
        
        // Fetch videos from all sources in parallel
        const [videosRes, trainingRes, pressRes, youtubeRes] = await Promise.all([
          supabase
            .from('videos')
            .select('*')
            .eq('is_published', true)
            .order('created_at', { ascending: false }),
          supabase
            .from('training_sessions')
            .select('*')
            .eq('is_published', true)
            .not('video_url', 'is', null)
            .order('training_date', { ascending: false }),
          supabase
            .from('press_conferences')
            .select('*')
            .eq('is_published', true)
            .not('video_url', 'is', null)
            .order('conference_date', { ascending: false }),
          supabase
            .from('youtube_videos')
            .select('*')
            .eq('is_published', true)
            .order('created_at', { ascending: false })
        ]);

        const allVideos: UnifiedVideo[] = [];

        // Process videos table
        if (videosRes.data) {
          videosRes.data.forEach(v => {
            allVideos.push({
              id: v.id,
              title: v.title,
              description: v.description || undefined,
              video_url: v.video_url,
              thumbnail_url: v.thumbnail_url || undefined,
              category: v.category || 'Vidéo',
              source: 'video',
              duration: v.duration || undefined,
              created_at: v.created_at,
              is_short: v.category?.toLowerCase().includes('short') || false
            });
          });
        }

        // Process training sessions
        if (trainingRes.data) {
          trainingRes.data.forEach(t => {
            allVideos.push({
              id: t.id,
              title: t.title,
              description: t.description || undefined,
              video_url: t.video_url!,
              thumbnail_url: t.thumbnail_url || undefined,
              category: 'Entraînement',
              source: 'training',
              created_at: t.created_at,
              is_short: false
            });
          });
        }

        // Process press conferences
        if (pressRes.data) {
          pressRes.data.forEach(p => {
            allVideos.push({
              id: p.id,
              title: p.title,
              description: p.description || undefined,
              video_url: p.video_url!,
              thumbnail_url: p.thumbnail_url || undefined,
              category: 'Conférence de presse',
              source: 'press',
              created_at: p.created_at,
              is_short: false
            });
          });
        }

        // Process YouTube videos
        if (youtubeRes.data) {
          youtubeRes.data.forEach(y => {
            // YouTube videos use youtube_url field
            const videoUrl = y.youtube_url;
            const youtubeId = extractYouTubeId(videoUrl);
            
            allVideos.push({
              id: y.id,
              title: y.title,
              description: undefined,
              video_url: videoUrl,
              thumbnail_url: y.thumbnail_url || (youtubeId ? `https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg` : undefined),
              category: 'YouTube',
              source: 'youtube',
              created_at: y.created_at,
              is_short: videoUrl.includes('/shorts/') || false
            });
          });
        }

        // Sort by date
        allVideos.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

        // Separate shorts from regular videos
        const regularVideos = allVideos.filter(v => !v.is_short);
        const shortVideos = allVideos.filter(v => v.is_short);

        setVideos(regularVideos);
        setShorts(shortVideos);
      } catch (err) {
        console.error('Erreur lors du chargement des vidéos:', err);
        setError('Impossible de charger les vidéos');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllVideos();
  }, []);

  return { videos, shorts, isLoading, error };
}

function extractYouTubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /youtube\.com\/shorts\/([^&\n?#]+)/
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}
