import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface SoundSettings {
  id: string;
  is_enabled: boolean;
  welcome_sound_enabled: boolean;
  welcome_sound_url_fr: string | null;
  welcome_sound_url_en: string | null;
  login_sound_enabled: boolean;
  login_sound_url_fr: string | null;
  login_sound_url_en: string | null;
  logout_sound_enabled: boolean;
  logout_sound_url_fr: string | null;
  logout_sound_url_en: string | null;
  volume: number;
  auto_language_detection: boolean;
  created_at: string;
  updated_at: string;
}

export const useSoundSettings = () => {
  return useQuery({
    queryKey: ["sound-settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sound_settings")
        .select("*")
        .single();

      if (error) {
        console.error("Error fetching sound settings:", error);
        return null;
      }

      return data as SoundSettings;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useUpdateSoundSettings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (updates: Partial<SoundSettings>) => {
      // Get the current settings first to get the ID
      const { data: currentSettings } = await supabase
        .from("sound_settings")
        .select("id")
        .single();

      if (!currentSettings?.id) {
        throw new Error("No sound settings found");
      }

      const { data, error } = await supabase
        .from("sound_settings")
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("id", currentSettings.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sound-settings"] });
    },
  });
};
