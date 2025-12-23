import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface HeroSettings {
  backgroundVideoEnabled: boolean;
  backgroundVideoUrl: string;
  mockupVideoUrl: string;
}

const MOCKUP_VIDEO_FILENAME = 'iPhone-mockups.mp4_1750270490323.mp4';
const BUCKET_NAME = 'media';

export function useHeroSettings() {
  const [settings, setSettings] = useState<HeroSettings>({
    backgroundVideoEnabled: false,
    backgroundVideoUrl: '',
    mockupVideoUrl: ''
  });
  const [isLoading, setIsLoading] = useState(true);

  const fetchSettings = async () => {
    try {
      // Fetch background video settings
      const { data, error } = await supabase
        .from('site_settings')
        .select('setting_key, setting_value')
        .in('setting_key', ['hero_background_video_enabled', 'hero_background_video_url']);

      if (error) throw error;

      let backgroundVideoEnabled = false;
      let backgroundVideoUrl = '';

      data?.forEach(item => {
        if (item.setting_key === 'hero_background_video_enabled') {
          backgroundVideoEnabled = item.setting_value === 'true';
        }
        if (item.setting_key === 'hero_background_video_url') {
          backgroundVideoUrl = item.setting_value || '';
        }
      });

      // Get mockup video URL
      const { data: mockupData } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(MOCKUP_VIDEO_FILENAME);

      const mockupVideoUrl = mockupData?.publicUrl 
        ? `${mockupData.publicUrl}?t=${Date.now()}`
        : '';

      setSettings({
        backgroundVideoEnabled,
        backgroundVideoUrl,
        mockupVideoUrl
      });
    } catch (error) {
      console.error('Error fetching hero settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();

    // Subscribe to changes
    const channel = supabase
      .channel('hero-settings-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'site_settings',
          filter: 'setting_key=in.(hero_background_video_enabled,hero_background_video_url)'
        },
        () => {
          fetchSettings();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const updateSetting = async (key: string, value: string) => {
    try {
      const { error } = await supabase
        .from('site_settings')
        .update({ setting_value: value })
        .eq('setting_key', key);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error updating setting:', error);
      return false;
    }
  };

  return {
    ...settings,
    isLoading,
    updateSetting,
    refetch: fetchSettings
  };
}
