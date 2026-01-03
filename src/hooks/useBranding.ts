import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";

interface BrandingSettings {
  id: string;
  logo_url: string | null;
  favicon_url: string | null;
  primary_color: string | null;
  secondary_color: string | null;
  accent_color: string | null;
  site_name: string | null;
}

const fetchBranding = async (): Promise<BrandingSettings | null> => {
  const { data, error } = await supabase
    .from('branding_settings')
    .select('*')
    .limit(1)
    .single();

  if (error) {
    console.error('Error fetching branding:', error);
    return null;
  }
  return data;
};

export function useBranding() {
  const queryClient = useQueryClient();

  const { data: branding, isLoading: loading } = useQuery({
    queryKey: ['branding-settings'],
    queryFn: fetchBranding,
    staleTime: 1000 * 60 * 5, // 5 min cache
    gcTime: 1000 * 60 * 30, // 30 min garbage collection
    refetchOnWindowFocus: false,
  });

  // Subscribe to real-time changes
  useEffect(() => {
    const channel = supabase
      .channel('branding-settings-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'branding_settings'
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['branding-settings'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  // Apply favicon dynamically
  useEffect(() => {
    if (branding?.favicon_url) {
      const link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
      if (link) {
        link.href = branding.favicon_url;
      } else {
        const newLink = document.createElement('link');
        newLink.rel = 'icon';
        newLink.href = branding.favicon_url;
        document.head.appendChild(newLink);
      }
    }
  }, [branding?.favicon_url]);

  return {
    branding,
    loading,
    logoUrl: branding?.logo_url || '/lovable-uploads/68f70788-6521-4d69-a55f-56bf305adf1d.png',
    siteName: branding?.site_name || 'HALA MADRID TV',
    refetch: () => queryClient.invalidateQueries({ queryKey: ['branding-settings'] })
  };
}
