import { supabase } from '@/integrations/supabase/client';

type LiveBlogScraperResponse = {
  success: boolean;
  error?: string;
  entriesImported?: number;
  entries?: any[];
  rawContentPreview?: string;
};

export const liveBlogScraperApi = {
  async importFromUrl(url: string, matchId: string): Promise<LiveBlogScraperResponse> {
    const { data, error } = await supabase.functions.invoke('scrape-live-blog', {
      body: { url, match_id: matchId },
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return data;
  },
};
