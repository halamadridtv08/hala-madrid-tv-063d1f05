import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

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

export function useLiveMatchBarSettings() {
  const [settings, setSettings] = useState<LiveMatchBarSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('live_match_bar_settings')
        .select('*')
        .eq('id', DEFAULT_SETTINGS_ID)
        .single();

      if (error) throw error;
      setSettings(data);
    } catch (err: any) {
      console.error('Error fetching live match bar settings:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

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
      setSettings(data);
      return { success: true };
    } catch (err: any) {
      console.error('Error updating live match bar settings:', err);
      return { success: false, error: err.message };
    }
  };

  useEffect(() => {
    fetchSettings();

    // Real-time subscription
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
        (payload) => {
          if (payload.new) {
            setSettings(payload.new as LiveMatchBarSettings);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return {
    settings,
    loading,
    error,
    updateSettings,
    refetch: fetchSettings
  };
}
