import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Calendar, FileText, Video, Image, Users, Target, Trophy, Newspaper, PlayCircle, Settings, HelpCircle, LucideIcon } from "lucide-react";

export interface ExploreCard {
  id: string;
  icon: string;
  title: string;
  description: string | null;
  url: string;
  display_order: number | null;
  is_active: boolean | null;
}

const ICON_MAP: Record<string, LucideIcon> = {
  Calendar,
  FileText,
  Video,
  Image,
  Users,
  Target,
  Trophy,
  Newspaper,
  PlayCircle,
  Settings,
  HelpCircle,
};

export function useExploreCards() {
  const [cards, setCards] = useState<ExploreCard[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCards = async () => {
    try {
      const { data, error } = await supabase
        .from('explore_cards')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (error) throw error;
      setCards(data || []);
    } catch (error) {
      console.error('Error fetching explore cards:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCards();

    const channel = supabase
      .channel('explore-cards-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'explore_cards' },
        () => fetchCards()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const getIconComponent = (iconName: string): LucideIcon => {
    return ICON_MAP[iconName] || HelpCircle;
  };

  return {
    cards,
    loading,
    getIconComponent,
    refetch: fetchCards
  };
}
