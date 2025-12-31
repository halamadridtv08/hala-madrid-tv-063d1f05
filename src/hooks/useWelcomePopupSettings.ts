import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface Feature {
  icon: string;
  label: string;
}

export interface WelcomePopupSettings {
  id: string;
  is_enabled: boolean;
  title: string;
  subtitle: string;
  button_text: string;
  footer_text: string;
  display_delay: number;
  features: Feature[];
}

const DEFAULT_SETTINGS: Omit<WelcomePopupSettings, 'id'> = {
  is_enabled: true,
  title: "¡Bienvenido a HALA MADRID TV!",
  subtitle: "Votre destination ultime pour toute l'actualité du Real Madrid",
  button_text: "¡Hala Madrid!",
  footer_text: "Hasta el final, vamos Real 💜",
  display_delay: 1500,
  features: [
    { icon: "⚽", label: "Matchs" },
    { icon: "📰", label: "Actualités" },
    { icon: "🏆", label: "Trophées" }
  ]
};

export function useWelcomePopupSettings() {
  const [settings, setSettings] = useState<WelcomePopupSettings | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('welcome_popup_settings')
        .select('*')
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      
      if (data) {
        // Parse features from JSON - cast through unknown for type safety
        const features = Array.isArray(data.features) 
          ? (data.features as unknown as Feature[])
          : DEFAULT_SETTINGS.features;
          
        setSettings({
          id: data.id,
          is_enabled: data.is_enabled ?? DEFAULT_SETTINGS.is_enabled,
          title: data.title || DEFAULT_SETTINGS.title,
          subtitle: data.subtitle || DEFAULT_SETTINGS.subtitle,
          button_text: data.button_text || DEFAULT_SETTINGS.button_text,
          footer_text: DEFAULT_SETTINGS.footer_text,
          display_delay: data.delay_ms || DEFAULT_SETTINGS.display_delay,
          features
        });
      } else {
        // Use defaults if no settings in DB
        setSettings({ id: '', ...DEFAULT_SETTINGS });
      }
    } catch (error) {
      console.error('Error fetching welcome popup settings:', error);
      setSettings({ id: '', ...DEFAULT_SETTINGS });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();

    const channel = supabase
      .channel('welcome-popup-changes')
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

  return {
    settings,
    loading,
    refetch: fetchSettings
  };
}
