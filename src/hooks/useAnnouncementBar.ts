import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";

interface AnnouncementBar {
  id: string;
  message: string;
  emoji: string | null;
  cta_text: string | null;
  cta_link: string | null;
  is_active: boolean;
  background_color: string | null;
  text_color: string | null;
}

const fetchActiveAnnouncement = async (): Promise<AnnouncementBar | null> => {
  const { data, error } = await supabase
    .from('announcement_bar')
    .select('*')
    .eq('is_active', true)
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return data;
};

const fetchAnnouncement = async (): Promise<AnnouncementBar | null> => {
  const { data, error } = await supabase
    .from('announcement_bar')
    .select('*')
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return data;
};

export function useAnnouncementBar() {
  const queryClient = useQueryClient();

  const { data: announcement = null, isLoading: loading } = useQuery({
    queryKey: ['announcement-bar', 'active'],
    queryFn: fetchActiveAnnouncement,
    staleTime: 1000 * 60 * 5, // 5 min cache
    gcTime: 1000 * 60 * 30,
    refetchOnWindowFocus: false,
  });

  // Subscribe to real-time changes
  useEffect(() => {
    const channel = supabase
      .channel('announcement-bar-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'announcement_bar'
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['announcement-bar'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return { 
    announcement, 
    loading, 
    refetch: () => queryClient.invalidateQueries({ queryKey: ['announcement-bar'] })
  };
}

export function useAnnouncementBarAdmin() {
  const queryClient = useQueryClient();

  const { data: announcement = null, isLoading: loading } = useQuery({
    queryKey: ['announcement-bar', 'admin'],
    queryFn: fetchAnnouncement,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
    refetchOnWindowFocus: false,
  });

  const updateAnnouncement = async (updates: Partial<AnnouncementBar>) => {
    if (!announcement) return;
    
    try {
      const { error } = await supabase
        .from('announcement_bar')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', announcement.id);

      if (error) throw error;
      queryClient.invalidateQueries({ queryKey: ['announcement-bar'] });
      return true;
    } catch (error) {
      console.error('Error updating announcement:', error);
      throw error;
    }
  };

  return { 
    announcement, 
    loading, 
    updateAnnouncement, 
    refetch: () => queryClient.invalidateQueries({ queryKey: ['announcement-bar'] })
  };
}
