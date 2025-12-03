import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface SiteVisibility {
  id: string;
  section_key: string;
  section_name: string;
  parent_key: string | null;
  is_visible: boolean;
  display_order: number;
}

export function useSiteVisibility() {
  const [visibility, setVisibility] = useState<Record<string, boolean>>({});
  const [sections, setSections] = useState<SiteVisibility[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchVisibility = async () => {
    try {
      const { data, error } = await supabase
        .from('site_visibility')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) throw error;

      if (data) {
        setSections(data);
        const visibilityMap: Record<string, boolean> = {};
        data.forEach(section => {
          visibilityMap[section.section_key] = section.is_visible;
        });
        setVisibility(visibilityMap);
      }
    } catch (error) {
      console.error('Error fetching site visibility:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVisibility();

    // Subscribe to changes
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
          fetchVisibility();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const isVisible = (sectionKey: string): boolean => {
    return visibility[sectionKey] !== false;
  };

  const toggleVisibility = async (sectionKey: string) => {
    const currentVisibility = visibility[sectionKey] !== false;
    
    try {
      const { error } = await supabase
        .from('site_visibility')
        .update({ is_visible: !currentVisibility })
        .eq('section_key', sectionKey);

      if (error) throw error;

      setVisibility(prev => ({
        ...prev,
        [sectionKey]: !currentVisibility
      }));
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
      
      await fetchVisibility();
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
    refetch: fetchVisibility 
  };
}
