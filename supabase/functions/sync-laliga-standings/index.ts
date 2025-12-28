import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const FOOTBALL_API_BASE = 'https://v3.football.api-sports.io';
const LA_LIGA_ID = 140;
const CURRENT_SEASON = new Date().getFullYear();

interface StandingTeam {
  rank: number;
  team: {
    id: number;
    name: string;
    logo: string;
  };
  points: number;
  goalsDiff: number;
  all: {
    played: number;
    win: number;
    draw: number;
    lose: number;
    goals: {
      for: number;
      against: number;
    };
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const footballApiKey = Deno.env.get('FOOTBALL_API_KEY');
    const cronSecret = Deno.env.get('CRON_SECRET');
    
    // Verify CRON_SECRET for scheduled calls
    const authHeader = req.headers.get('Authorization');
    const requestCronSecret = req.headers.get('x-cron-secret');
    
    let isAuthorized = false;
    
    if (cronSecret && requestCronSecret === cronSecret) {
      isAuthorized = true;
      console.log('Authenticated via CRON_SECRET');
    }
    
    if (!isAuthorized && authHeader) {
      const token = authHeader.replace('Bearer ', '');
      const supabaseClient = createClient(supabaseUrl, Deno.env.get('SUPABASE_ANON_KEY') ?? '', {
        global: { headers: { Authorization: `Bearer ${token}` } }
      });
      
      const { data: { user } } = await supabaseClient.auth.getUser();
      
      if (user) {
        const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
        const { data: roleData } = await supabaseAdmin
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .eq('role', 'admin')
          .single();
          
        if (roleData) {
          isAuthorized = true;
        }
      }
    }
    
    if (!isAuthorized) {
      return new Response(
        JSON.stringify({ error: 'Authentication required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!footballApiKey) {
      console.error('FOOTBALL_API_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'Football API key not configured' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch standings from Football API
    console.log(`Fetching La Liga standings for season ${CURRENT_SEASON}...`);
    
    const response = await fetch(
      `${FOOTBALL_API_BASE}/standings?league=${LA_LIGA_ID}&season=${CURRENT_SEASON}`,
      {
        headers: {
          'x-apisports-key': footballApiKey,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Football API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.errors && Object.keys(data.errors).length > 0) {
      console.error('API returned errors:', data.errors);
      throw new Error(`API errors: ${JSON.stringify(data.errors)}`);
    }

    const standings = data.response?.[0]?.league?.standings?.[0] as StandingTeam[] | undefined;

    if (!standings || standings.length === 0) {
      console.log('No standings data received');
      return new Response(
        JSON.stringify({ message: 'No standings data available' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Received ${standings.length} teams standings`);

    // Upsert standings to database
    const standingsToUpsert = standings.map((team: StandingTeam) => ({
      team_api_id: team.team.id,
      team_name: team.team.name,
      team_logo: team.team.logo,
      rank: team.rank,
      points: team.points,
      played: team.all.played,
      won: team.all.win,
      drawn: team.all.draw,
      lost: team.all.lose,
      goals_for: team.all.goals.for,
      goals_against: team.all.goals.against,
      goal_difference: team.goalsDiff,
      season: CURRENT_SEASON,
      league_id: LA_LIGA_ID,
      updated_at: new Date().toISOString(),
    }));

    // Check if table exists, if not just log the data
    const { error: upsertError } = await supabaseAdmin
      .from('laliga_standings')
      .upsert(standingsToUpsert, { 
        onConflict: 'team_api_id,season',
        ignoreDuplicates: false 
      });

    if (upsertError) {
      // Table might not exist, just return the data
      console.log('Could not save to database (table may not exist):', upsertError.message);
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Standings fetched but not saved (table not configured)',
          standings: standingsToUpsert
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Standings updated successfully');

    return new Response(
      JSON.stringify({ 
        success: true, 
        teams_updated: standings.length,
        season: CURRENT_SEASON
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error syncing standings:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
