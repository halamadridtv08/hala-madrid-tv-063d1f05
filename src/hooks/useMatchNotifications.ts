import { useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface MatchEvent {
  type: 'goal' | 'yellow_card' | 'red_card' | 'substitution';
  player: string;
  team: string;
  minute: number;
}

export function useMatchNotifications(matchId?: string) {
  const previousEvents = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!matchId) return;

    const channel = supabase
      .channel(`match-events-${matchId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'matches',
          filter: `id=eq.${matchId}`
        },
        (payload) => {
          const newData = payload.new as any;
          const matchDetails = newData.match_details;
          
          if (matchDetails?.events) {
            matchDetails.events.forEach((event: any) => {
              const eventKey = `${event.type}-${event.minute}-${event.player}`;
              
              if (!previousEvents.current.has(eventKey)) {
                previousEvents.current.add(eventKey);
                showEventNotification(event);
              }
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [matchId]);

  const showEventNotification = (event: MatchEvent) => {
    const toastConfig = {
      duration: 5000,
      className: "animate-slide-in-right",
    };

    switch (event.type) {
      case 'goal':
        toast.success(
          `⚽ BUT! ${event.player} (${event.minute}')`,
          {
            ...toastConfig,
            description: event.team,
            icon: "⚽",
          }
        );
        break;
      
      case 'yellow_card':
        toast.warning(
          `🟨 Carton jaune - ${event.player} (${event.minute}')`,
          {
            ...toastConfig,
            description: event.team,
          }
        );
        break;
      
      case 'red_card':
        toast.error(
          `🟥 Carton rouge - ${event.player} (${event.minute}')`,
          {
            ...toastConfig,
            description: event.team,
          }
        );
        break;
      
      case 'substitution':
        toast.info(
          `🔄 Remplacement - ${event.player} (${event.minute}')`,
          {
            ...toastConfig,
            description: event.team,
          }
        );
        break;
    }
  };
}

// Hook global pour écouter tous les matchs en direct
export function useLiveMatchNotifications() {
  useEffect(() => {
    const channel = supabase
      .channel(`live-matches-${Math.random().toString(36).slice(2)}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'matches',
          filter: 'status=eq.live'
        },
        (payload) => {
          const newData = payload.new as any;
          const oldData = payload.old as any;
          
          // Détecter les changements de score
          if (newData.home_score !== oldData.home_score) {
            toast.success(
              `⚽ ${newData.home_team} ${newData.home_score} - ${newData.away_score} ${newData.away_team}`,
              {
                duration: 8000,
                description: "But marqué!",
              }
            );
          }
          
          if (newData.away_score !== oldData.away_score) {
            toast.success(
              `⚽ ${newData.home_team} ${newData.home_score} - ${newData.away_score} ${newData.away_team}`,
              {
                duration: 8000,
                description: "But marqué!",
              }
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);
}
