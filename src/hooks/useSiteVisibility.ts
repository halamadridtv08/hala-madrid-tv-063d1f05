import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";

interface SiteVisibility {
  id: string;
  section_key: string;
  section_name: string;
  parent_key: string | null;
  is_visible: boolean;
  display_order: number;
}

const fetchVisibility = async (): Promise<SiteVisibility[]> => {
  const { data, error } = await supabase
    .from('site_visibility')
    .select('*')
    .order('display_order', { ascending: true });

  if (error) throw error;
  return data || [];
};

export function useSiteVisibility() {
  const queryClient = useQueryClient();

  const { data: sections = [], isLoading: loading } = useQuery({
    queryKey: ['site-visibility'],
    queryFn: fetchVisibility,
    staleTime: 1000 * 60 * 5, // 5 min cache
    gcTime: 1000 * 60 * 30, // 30 min garbage collection
    refetchOnWindowFocus: false,
  });

  // Build visibility map from sections
  const visibility = sections.reduce<Record<string, boolean>>((acc, section) => {
    acc[section.section_key] = section.is_visible;
    return acc;
  }, {});

  // Subscribe to real-time changes
  useEffect(() => {
    const channel = supabase
      .channel('site-visibility-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'site_visibility'
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['site-visibility'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  const isVisible = (sectionKey: string): boolean => {
    // During loading, return false to prevent flash of content
    if (loading) return false;
    // Explicitly check for true - if not in map or false, hide
    return visibility[sectionKey] === true;
  };

  const toggleVisibility = async (sectionKey: string) => {
    const currentVisibility = visibility[sectionKey] !== false;
    
    try {
      const { error } = await supabase
        .from('site_visibility')
        .update({ is_visible: !currentVisibility })
        .eq('section_key', sectionKey);

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ['site-visibility'] });
    } catch (error) {
      console.error('Error toggling visibility:', error);
      throw error;
    }
  };

  const updateSectionName = async (sectionKey: string, newName: string) => {
    try {
      const { error } = await supabase
        .from('site_visibility')
        .update({ section_name: newName })
        .eq('section_key', sectionKey);

      if (error) throw error;
      
      queryClient.invalidateQueries({ queryKey: ['site-visibility'] });
    } catch (error) {
      console.error('Error updating section name:', error);
      throw error;
    }
  };

  return { 
    visibility, 
    sections, 
    loading, 
    isVisible, 
    toggleVisibility,
    updateSectionName,
    refetch: () => queryClient.invalidateQueries({ queryKey: ['site-visibility'] })
  };
}
