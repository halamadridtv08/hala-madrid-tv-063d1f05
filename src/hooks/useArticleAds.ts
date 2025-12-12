import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface ArticleAd {
  id: string;
  title: string;
  image_url: string;
  link_url: string | null;
  aspect_ratio: string;
  custom_width: number | null;
  custom_height: number | null;
  position: string;
  display_order: number;
  is_active: boolean;
  start_date: string | null;
  end_date: string | null;
  click_count: number;
  impression_count: number;
  created_at: string;
  updated_at: string;
}

export function useArticleAds(position?: string) {
  const [ads, setAds] = useState<ArticleAd[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAds = async () => {
    try {
      let query = supabase
        .from('article_ads')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (position) {
        query = query.eq('position', position);
      }

      const { data, error } = await query;

      if (error) throw error;
      setAds((data || []) as ArticleAd[]);
    } catch (error) {
      console.error('Error fetching article ads:', error);
    } finally {
      setLoading(false);
    }
  };

  const trackClick = async (adId: string) => {
    try {
      const ad = ads.find(a => a.id === adId);
      if (ad) {
        await supabase
          .from('article_ads')
          .update({ click_count: (ad.click_count || 0) + 1 })
          .eq('id', adId);
      }
    } catch (error) {
      console.error('Error tracking click:', error);
    }
  };

  useEffect(() => {
    fetchAds();
  }, [position]);

  return { ads, loading, trackClick, refetch: fetchAds };
}

export function useArticleAdsAdmin() {
  const [ads, setAds] = useState<ArticleAd[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAds = async () => {
    try {
      const { data, error } = await supabase
        .from('article_ads')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) throw error;
      setAds((data || []) as ArticleAd[]);
    } catch (error) {
      console.error('Error fetching article ads:', error);
    } finally {
      setLoading(false);
    }
  };

  const createAd = async (ad: Omit<ArticleAd, 'id' | 'created_at' | 'updated_at' | 'click_count' | 'impression_count'>) => {
    const { data, error } = await supabase
      .from('article_ads')
      .insert(ad)
      .select()
      .single();

    if (error) throw error;
    await fetchAds();
    return data;
  };

  const updateAd = async (id: string, ad: Partial<ArticleAd>) => {
    const { error } = await supabase
      .from('article_ads')
      .update(ad)
      .eq('id', id);

    if (error) throw error;
    await fetchAds();
  };

  const deleteAd = async (id: string) => {
    const { error } = await supabase
      .from('article_ads')
      .delete()
      .eq('id', id);

    if (error) throw error;
    await fetchAds();
  };

  useEffect(() => {
    fetchAds();
  }, []);

  return { ads, loading, createAd, updateAd, deleteAd, refetch: fetchAds };
}
