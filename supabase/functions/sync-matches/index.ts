import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ExternalMatch {
  id: string;
  homeTeam: string;
  awayTeam: string;
  date: string;
  venue?: string;
  competition?: string;
  status: string;
  homeScore?: number;
  awayScore?: number;
}

// Simuler une API externe de calendrier officiel
async function fetchExternalMatches(): Promise<ExternalMatch[]> {
  // En production, remplacer par l'API réelle du calendrier officiel
  // Par exemple: LaLiga API, UEFA API, etc.
  
  return [
    {
      id: "ext_1",
      homeTeam: "Real Madrid",
      awayTeam: "Atlético Madrid",
      date: "2025-03-15T20:00:00Z",
      venue: "Santiago Bernabéu",
      competition: "La Liga",
      status: "upcoming"
    },
    {
      id: "ext_2", 
      homeTeam: "PSG",
      awayTeam: "Real Madrid",
      date: "2025-03-18T20:00:00Z",
      venue: "Parc des Princes",
      competition: "Ligue des Champions",
      status: "upcoming"
    }
  ];
}

async function syncMatches(supabaseClient: any) {
  try {
    // Récupérer les matchs externes
    const externalMatches = await fetchExternalMatches();
    
    // Récupérer les matchs existants en base
    const { data: existingMatches, error: fetchError } = await supabaseClient
      .from('matches')
      .select('*');
      
    if (fetchError) throw fetchError;

    const existingMatchIds = new Set(existingMatches?.map((m: any) => m.id) || []);
    
    // Synchroniser chaque match externe
    for (const externalMatch of externalMatches) {
      const matchData = {
        id: externalMatch.id,
        home_team: externalMatch.homeTeam,
        away_team: externalMatch.awayTeam,
        match_date: externalMatch.date,
        venue: externalMatch.venue,
        competition: externalMatch.competition,
        status: externalMatch.status,
        home_score: externalMatch.homeScore,
        away_score: externalMatch.awayScore
      };

      if (existingMatchIds.has(externalMatch.id)) {
        // Mettre à jour le match existant
        const { error } = await supabaseClient
          .from('matches')
          .update(matchData)
          .eq('id', externalMatch.id);
          
        if (error) {
          console.error(`Erreur mise à jour match ${externalMatch.id}:`, error);
        } else {
          console.log(`Match ${externalMatch.id} mis à jour`);
        }
      } else {
        // Créer un nouveau match
        const { error } = await supabaseClient
          .from('matches')
          .insert([matchData]);
          
        if (error) {
          console.error(`Erreur création match ${externalMatch.id}:`, error);
        } else {
          console.log(`Match ${externalMatch.id} créé`);
        }
      }
    }

    return { success: true, processed: externalMatches.length };
  } catch (error) {
    console.error('Erreur synchronisation:', error);
    throw error;
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const result = await syncMatches(supabaseClient);
    
    return new Response(
      JSON.stringify({
        message: 'Synchronisation réussie',
        data: result
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: 'Erreur lors de la synchronisation',
        details: error.message
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});