import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface SiteContent {
  id: string;
  content_key: string;
  content_value: string;
  content_type: string;
  section: string;
  description: string | null;
  language: string;
}

export function useSiteContent() {
  const [content, setContent] = useState<Record<string, string>>({});
  const [allContent, setAllContent] = useState<SiteContent[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchContent = async () => {
    try {
      const { data, error } = await supabase
        .from('site_content')
        .select('*')
        .order('section', { ascending: true });

      if (error) throw error;

      if (data) {
        setAllContent(data);
        const contentMap: Record<string, string> = {};
        data.forEach(item => {
          contentMap[item.content_key] = item.content_value;
        });
        setContent(contentMap);
      }
    } catch (error) {
      console.error('Error fetching site content:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContent();

    const channel = supabase
      .channel('site-content-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'site_content' },
        () => fetchContent()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

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
      
      setContent(prev => ({ ...prev, [key]: value }));
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
      await fetchContent();
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
      await fetchContent();
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
    refetch: fetchContent
  };
}
