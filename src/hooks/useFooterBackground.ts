import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface FooterBackgroundSettings {
  isEnabled: boolean;
  type: 'image' | 'video' | 'none';
  url: string;
}

export function useFooterBackground() {
  const [settings, setSettings] = useState<FooterBackgroundSettings>({
    isEnabled: false,
    type: 'none',
    url: ''
  });
  const [isLoading, setIsLoading] = useState(true);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from("site_settings")
        .select("setting_key, setting_value")
        .in("setting_key", [
          "footer_background_enabled",
          "footer_background_type",
          "footer_background_url"
        ]);

      if (error) throw error;

      const newSettings: FooterBackgroundSettings = {
        isEnabled: false,
        type: 'none',
        url: ''
      };

      data?.forEach((item) => {
        if (item.setting_key === "footer_background_enabled") {
          newSettings.isEnabled = item.setting_value === "true";
        }
        if (item.setting_key === "footer_background_type") {
          newSettings.type = (item.setting_value as 'image' | 'video' | 'none') || 'none';
        }
        if (item.setting_key === "footer_background_url") {
          newSettings.url = item.setting_value || '';
        }
      });

      setSettings(newSettings);
    } catch (error) {
      console.error("Error fetching footer background settings:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();

    const channel = supabase
      .channel("footer-background-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "site_settings",
          filter: "setting_key=in.(footer_background_enabled,footer_background_type,footer_background_url)"
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

  const updateSetting = async (key: string, value: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from("site_settings")
        .update({ setting_value: value })
        .eq("setting_key", key);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error(`Error updating ${key}:`, error);
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
