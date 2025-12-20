import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useSiteVisibility } from "./useSiteVisibility";

interface SplineSettings {
  url: string;
  isVisible: boolean;
}

export function useSplineSettings() {
  const [settings, setSettings] = useState<SplineSettings>({
    url: "",
    isVisible: false,
  });
  const [loading, setLoading] = useState(true);
  const { isVisible } = useSiteVisibility();

  const fetchSplineUrl = async () => {
    try {
      const { data, error } = await supabase
        .from("site_settings")
        .select("setting_value")
        .eq("setting_key", "footer_spline_url")
        .single();

      if (error && error.code !== "PGRST116") throw error;

      setSettings({
        url: data?.setting_value || "",
        isVisible: isVisible("footer_spline"),
      });
    } catch (error) {
      console.error("Error fetching Spline settings:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSplineUrl();
  }, []);

  // Update visibility when it changes
  useEffect(() => {
    setSettings((prev) => ({
      ...prev,
      isVisible: isVisible("footer_spline"),
    }));
  }, [isVisible]);

  const updateSplineUrl = async (newUrl: string) => {
    try {
      const { error } = await supabase
        .from("site_settings")
        .update({ setting_value: newUrl })
        .eq("setting_key", "footer_spline_url");

      if (error) throw error;

      setSettings((prev) => ({
        ...prev,
        url: newUrl,
      }));

      return true;
    } catch (error) {
      console.error("Error updating Spline URL:", error);
      throw error;
    }
  };

  return {
    splineUrl: settings.url,
    isSplineVisible: settings.isVisible,
    loading,
    updateSplineUrl,
    refetch: fetchSplineUrl,
  };
}
