import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Match } from "@/types/Match";
import { toast } from "sonner";

export function useMatches() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMatches = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('matches')
        .select('*')
        .order('match_date', { ascending: true });

      if (error) throw error;
      
      setMatches(data || []);
    } catch (err) {
      console.error('Erreur lors du chargement des matchs:', err);
      setError('Erreur lors du chargement des matchs');
      toast.error('Erreur lors du chargement des matchs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Chargement initial
    fetchMatches();

    // Configuration de la synchronisation temps réel
    const channel = supabase
      .channel('matches-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'matches'
        },
        (payload) => {
          console.log('Changement détecté dans les matchs:', payload);
          
          if (payload.eventType === 'INSERT') {
            setMatches(prev => [...prev, payload.new as Match]);
            toast.success('Nouveau match ajouté');
          } else if (payload.eventType === 'UPDATE') {
            setMatches(prev => 
              prev.map(match => 
                match.id === payload.new.id ? payload.new as Match : match
              )
            );
            toast.info('Match mis à jour');
          } else if (payload.eventType === 'DELETE') {
            setMatches(prev => 
              prev.filter(match => match.id !== payload.old.id)
            );
            toast.info('Match supprimé');
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const getUpcomingMatches = () => {
    const now = new Date();
    return matches.filter(match => 
      new Date(match.match_date) >= now && 
      (match.status === 'upcoming' || match.status === 'live')
    );
  };

  const getPastMatches = () => {
    const now = new Date();
    return matches
      .filter(match => 
        new Date(match.match_date) < now || 
        match.status === 'finished'
      )
      .sort((a, b) => new Date(b.match_date).getTime() - new Date(a.match_date).getTime()); // Plus récent en premier
  };

  return {
    matches,
    upcomingMatches: getUpcomingMatches(),
    pastMatches: getPastMatches(),
    loading,
    error,
    refetch: fetchMatches
  };
}