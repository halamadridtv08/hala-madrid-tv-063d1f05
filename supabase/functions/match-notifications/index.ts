import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface UpcomingMatch {
  id: string;
  home_team: string;
  away_team: string;
  match_date: string;
  competition: string | null;
  venue: string | null;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const cronSecret = Deno.env.get('CRON_SECRET');
    
    // Verify CRON_SECRET for scheduled calls or admin JWT
    const authHeader = req.headers.get('Authorization');
    const requestCronSecret = req.headers.get('x-cron-secret');
    
    let isAuthorized = false;
    
    // Check CRON_SECRET
    if (cronSecret && requestCronSecret === cronSecret) {
      isAuthorized = true;
      console.log('Authenticated via CRON_SECRET');
    }
    
    // Check JWT for admin
    if (!isAuthorized && authHeader) {
      const token = authHeader.replace('Bearer ', '');
      const supabaseClient = createClient(supabaseUrl, Deno.env.get('SUPABASE_ANON_KEY') ?? '', {
        global: { headers: { Authorization: `Bearer ${token}` } }
      });
      
      const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
      
      if (!authError && user) {
        const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
        const { data: roleData } = await supabaseAdmin
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .eq('role', 'admin')
          .single();
          
        if (roleData) {
          isAuthorized = true;
          console.log('Authenticated via admin JWT');
        }
      }
    }
    
    if (!isAuthorized) {
      console.error('Authentication failed');
      return new Response(
        JSON.stringify({ error: 'Authentication required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
    
    // Get OneSignal config
    const { data: integration, error: integrationError } = await supabaseAdmin
      .from('integrations')
      .select('config, is_enabled')
      .eq('integration_key', 'onesignal')
      .single();

    if (integrationError || !integration?.is_enabled) {
      console.log('OneSignal not enabled, skipping notifications');
      return new Response(
        JSON.stringify({ message: 'OneSignal not enabled', notifications_sent: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const config = integration.config as { app_id?: string; api_key?: string };
    const { app_id, api_key } = config;

    if (!app_id || !api_key) {
      console.error('OneSignal config incomplete');
      return new Response(
        JSON.stringify({ error: 'OneSignal configuration incomplete' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse request body for hours_before parameter (default: 24 hours)
    let hoursBefore = 24;
    try {
      const body = await req.json();
      if (body.hours_before) {
        hoursBefore = parseInt(body.hours_before);
      }
    } catch {
      // Use default
    }

    // Get matches happening within the next X hours
    const now = new Date();
    const targetTime = new Date(now.getTime() + hoursBefore * 60 * 60 * 1000);
    
    // Get matches that are:
    // 1. Within the target time window
    // 2. Status is 'upcoming' or null
    // 3. Involving Real Madrid
    const { data: upcomingMatches, error: matchesError } = await supabaseAdmin
      .from('matches')
      .select('id, home_team, away_team, match_date, competition, venue')
      .gte('match_date', now.toISOString())
      .lte('match_date', targetTime.toISOString())
      .or('status.is.null,status.eq.upcoming')
      .order('match_date', { ascending: true });

    if (matchesError) {
      console.error('Error fetching matches:', matchesError);
      throw matchesError;
    }

    console.log(`Found ${upcomingMatches?.length || 0} upcoming matches within ${hoursBefore} hours`);

    if (!upcomingMatches || upcomingMatches.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No upcoming matches found', notifications_sent: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const notificationsSent: string[] = [];

    for (const match of upcomingMatches as UpcomingMatch[]) {
      const matchDate = new Date(match.match_date);
      const hoursUntilMatch = Math.round((matchDate.getTime() - now.getTime()) / (1000 * 60 * 60));
      
      // Format match time
      const matchTime = matchDate.toLocaleTimeString('fr-FR', { 
        hour: '2-digit', 
        minute: '2-digit',
        timeZone: 'Europe/Paris'
      });
      
      const matchDay = matchDate.toLocaleDateString('fr-FR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        timeZone: 'Europe/Paris'
      });

      // Create notification content
      const isHome = match.home_team.toLowerCase().includes('real madrid');
      const opponent = isHome ? match.away_team : match.home_team;
      const venueInfo = match.venue ? ` au ${match.venue}` : '';
      const competitionInfo = match.competition ? ` (${match.competition})` : '';
      
      let title: string;
      let message: string;
      
      if (hoursUntilMatch <= 1) {
        title = '⚽ Match imminent!';
        message = `Real Madrid vs ${opponent} commence dans moins d'une heure!${competitionInfo}`;
      } else if (hoursUntilMatch <= 3) {
        title = '⚽ Match bientôt!';
        message = `Real Madrid vs ${opponent} commence dans ${hoursUntilMatch}h${venueInfo}${competitionInfo}`;
      } else {
        title = `⚽ Match ${matchDay}`;
        message = `Real Madrid vs ${opponent} à ${matchTime}${venueInfo}${competitionInfo}`;
      }

      console.log(`Sending notification for match: ${match.home_team} vs ${match.away_team}`);

      // Send notification via OneSignal
      const response = await fetch('https://onesignal.com/api/v1/notifications', {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${api_key}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          app_id,
          included_segments: ['Subscribed Users'],
          headings: { en: title, fr: title, es: title },
          contents: { en: message, fr: message, es: message },
          data: { 
            match_id: match.id,
            type: 'match_reminder'
          },
          chrome_web_icon: '/favicon.ico',
          url: `/matches?id=${match.id}`,
        }),
      });

      const result = await response.json();
      
      if (response.ok) {
        console.log(`Notification sent successfully for match ${match.id}:`, result);
        notificationsSent.push(match.id);
      } else {
        console.error(`Failed to send notification for match ${match.id}:`, result);
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        notifications_sent: notificationsSent.length,
        match_ids: notificationsSent
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in match-notifications:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
