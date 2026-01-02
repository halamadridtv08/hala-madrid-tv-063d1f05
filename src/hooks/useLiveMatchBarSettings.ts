import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useEffect } from 'react';

export interface LiveMatchBarSettings {
  id: string;
  active_match_id: string | null;
  is_forced_active: boolean;
  custom_message: string | null;
  background_image_url: string | null;
  promo_image_url: string | null;
  promo_link: string | null;
  show_scores: boolean;
  show_timer: boolean;
  custom_cta_text: string | null;
  custom_cta_link: string | null;
  theme_color: string;
  updated_at: string;
}

const DEFAULT_SETTINGS_ID = '00000000-0000-0000-0000-000000000001';

const fetchSettings = async (): Promise<LiveMatchBarSettings | null> => {
  const { data, error } = await supabase
    .from('live_match_bar_settings')
    .select('*')
    .eq('id', DEFAULT_SETTINGS_ID)
    .single();

  if (error) throw error;
  return data;
};

export function useLiveMatchBarSettings() {
  const queryClient = useQueryClient();

  const { data: settings = null, isLoading: loading, error } = useQuery({
    queryKey: ['live-match-bar-settings'],
    queryFn: fetchSettings,
    staleTime: 1000 * 60 * 5, // 5 min cache
    gcTime: 1000 * 60 * 30,
    refetchOnWindowFocus: false,
  });

  // Real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel('live_match_bar_settings_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'live_match_bar_settings',
          filter: `id=eq.${DEFAULT_SETTINGS_ID}`
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['live-match-bar-settings'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  const updateSettings = async (updates: Partial<LiveMatchBarSettings>) => {
    try {
      const { data, error } = await supabase
        .from('live_match_bar_settings')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', DEFAULT_SETTINGS_ID)
        .select()
        .single();

      if (error) throw error;
      queryClient.invalidateQueries({ queryKey: ['live-match-bar-settings'] });
      return { success: true };
    } catch (err: any) {
      console.error('Error updating live match bar settings:', err);
      return { success: false, error: err.message };
    }
  };

  return {
    settings,
    loading,
    error: error?.message || null,
    updateSettings,
    refetch: () => queryClient.invalidateQueries({ queryKey: ['live-match-bar-settings'] })
  };
}
