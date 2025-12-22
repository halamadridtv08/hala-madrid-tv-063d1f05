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
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Check for CRON_SECRET first (for scheduled jobs)
    const cronSecret = Deno.env.get('CRON_SECRET');
    const authHeader = req.headers.get('Authorization');
    
    // Extract token from Authorization header
    const token = authHeader?.replace('Bearer ', '');
    
    // If CRON_SECRET is set and matches the token, allow the request (CRON job)
    if (cronSecret && token === cronSecret) {
      console.log('Match sync initiated by CRON job');
      const result = await syncMatches(supabaseClient);
      console.log(`CRON sync completed: ${result.processed} matches processed`);
      
      return new Response(
        JSON.stringify({
          message: 'Synchronisation CRON réussie',
          data: result
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    }

    // Otherwise, verify JWT authentication for admin users
    if (!authHeader) {
      console.error('Match sync attempted without authorization header');
      return new Response(
        JSON.stringify({ error: 'Unauthorized - Authorization header required' }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Get user from token
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);

    if (authError || !user) {
      console.error('Match sync attempted with invalid token:', authError?.message);
      return new Response(
        JSON.stringify({ error: 'Invalid authentication token' }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Check admin role
    const { data: roleData, error: roleError } = await supabaseClient
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .single();

    if (roleError || !roleData) {
      console.warn(`Match sync denied for user ${user.id} - admin role required`);
      return new Response(
        JSON.stringify({ error: 'Admin access required' }),
        {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Log successful sync attempt
    console.log(`Match sync initiated by admin user ${user.id} (${user.email})`);

    const result = await syncMatches(supabaseClient);
    
    console.log(`Match sync completed successfully by user ${user.id}: ${result.processed} matches processed`);
    
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
    console.error('Match sync error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({
        error: 'Erreur lors de la synchronisation',
        details: errorMessage
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
