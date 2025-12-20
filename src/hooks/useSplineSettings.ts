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

  // Extract Spline URL from HTML content or direct URL
  const extractSplineUrl = (value: string): string => {
    if (!value) return "";
    
    // If it's already a direct URL, return it
    if (value.startsWith("https://prod.spline.design/")) {
      return value;
    }
    
    // Extract URL from spline-viewer tag
    const match = value.match(/url="([^"]+)"/);
    if (match && match[1]) {
      return match[1];
    }
    
    return value;
  };

  const fetchSplineUrl = async () => {
    try {
      const { data, error } = await supabase
        .from("site_settings")
        .select("setting_value")
        .eq("setting_key", "footer_spline_url")
        .single();

      if (error && error.code !== "PGRST116") throw error;

      const extractedUrl = extractSplineUrl(data?.setting_value || "");
      
      setSettings({
        url: extractedUrl,
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

  // Compute visibility separately to avoid infinite loops
  const footerSplineVisible = isVisible("footer_spline");
  
  // Update visibility when it changes
  useEffect(() => {
    setSettings((prev) => ({
      ...prev,
      isVisible: footerSplineVisible,
    }));
  }, [footerSplineVisible]);

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
