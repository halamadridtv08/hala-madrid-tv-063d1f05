import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Json } from "@/integrations/supabase/types";

interface Feature {
  icon: string;
  label: string;
}

interface WelcomePopupSettings {
  id: string;
  is_enabled: boolean;
  title: string;
  subtitle: string;
  button_text: string;
  footer_text?: string;
  delay_ms: number;
  features: Feature[];
}

export function useWelcomePopupSettings() {
  const [settings, setSettings] = useState<WelcomePopupSettings | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('welcome_popup_settings')
        .select('*')
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      
      if (data) {
        const features = Array.isArray(data.features) 
          ? (data.features as Json[]).map((f) => {
              const feature = f as { icon?: string; label?: string };
              return {
                icon: feature?.icon || '⚽',
                label: feature?.label || ''
              };
            })
          : [];
        
        setSettings({
          ...data,
          features
        });
      }
    } catch (error) {
      console.error('Error fetching welcome popup settings:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();

    const channel = supabase
      .channel('welcome-popup-settings-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'welcome_popup_settings' },
        () => fetchSettings()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return { settings, loading, refetch: fetchSettings };
}
