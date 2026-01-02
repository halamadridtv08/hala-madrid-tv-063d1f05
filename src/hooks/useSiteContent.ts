import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";

interface SiteContent {
  id: string;
  content_key: string;
  content_value: string;
  content_type: string;
  section: string;
  description: string | null;
  language: string;
}

const fetchContent = async (): Promise<SiteContent[]> => {
  const { data, error } = await supabase
    .from('site_content')
    .select('*')
    .order('section', { ascending: true });

  if (error) throw error;
  return data || [];
};

export function useSiteContent() {
  const queryClient = useQueryClient();

  const { data: allContent = [], isLoading: loading } = useQuery({
    queryKey: ['site-content'],
    queryFn: fetchContent,
    staleTime: 1000 * 60 * 5, // 5 min cache
    gcTime: 1000 * 60 * 30,
    refetchOnWindowFocus: false,
  });

  // Build content map from allContent
  const content = allContent.reduce<Record<string, string>>((acc, item) => {
    acc[item.content_key] = item.content_value;
    return acc;
  }, {});

  // Subscribe to real-time changes
  useEffect(() => {
    const channel = supabase
      .channel('site-content-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'site_content' },
        () => queryClient.invalidateQueries({ queryKey: ['site-content'] })
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  const getContent = (key: string, fallback: string = ''): string => {
    return content[key] || fallback;
  };

  const updateContent = async (key: string, value: string) => {
    try {
      const { error } = await supabase
        .from('site_content')
        .update({ content_value: value })
        .eq('content_key', key);

      if (error) throw error;
      
      queryClient.invalidateQueries({ queryKey: ['site-content'] });
    } catch (error) {
      console.error('Error updating content:', error);
      throw error;
    }
  };

  const createContent = async (newContent: Omit<SiteContent, 'id'>) => {
    try {
      const { error } = await supabase
        .from('site_content')
        .insert(newContent);

      if (error) throw error;
      queryClient.invalidateQueries({ queryKey: ['site-content'] });
    } catch (error) {
      console.error('Error creating content:', error);
      throw error;
    }
  };

  const deleteContent = async (key: string) => {
    try {
      const { error } = await supabase
        .from('site_content')
        .delete()
        .eq('content_key', key);

      if (error) throw error;
      queryClient.invalidateQueries({ queryKey: ['site-content'] });
    } catch (error) {
      console.error('Error deleting content:', error);
      throw error;
    }
  };

  return {
    content,
    allContent,
    loading,
    getContent,
    updateContent,
    createContent,
    deleteContent,
    refetch: () => queryClient.invalidateQueries({ queryKey: ['site-content'] })
  };
}
