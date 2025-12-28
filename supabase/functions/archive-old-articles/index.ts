import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const cronSecret = Deno.env.get('CRON_SECRET');
    
    // Verify CRON_SECRET
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

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
    
    // Parse request body for days_old parameter (default: 365 days)
    let daysOld = 365;
    let deleteOld = false;
    try {
      const body = await req.json();
      if (body.days_old) {
        daysOld = parseInt(body.days_old);
      }
      if (body.delete) {
        deleteOld = body.delete === true;
      }
    } catch {
      // Use defaults
    }

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    console.log(`Archiving articles older than ${daysOld} days (before ${cutoffDate.toISOString()})`);

    // Get count of old articles
    const { count: oldArticlesCount, error: countError } = await supabaseAdmin
      .from('articles')
      .select('*', { count: 'exact', head: true })
      .lt('published_at', cutoffDate.toISOString())
      .eq('is_published', true);

    if (countError) {
      throw countError;
    }

    console.log(`Found ${oldArticlesCount || 0} articles older than ${daysOld} days`);

    if (!oldArticlesCount || oldArticlesCount === 0) {
      return new Response(
        JSON.stringify({ 
          message: 'No old articles to archive',
          articles_archived: 0 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Option 1: Mark as archived (add to archived category or set a flag)
    // Since we don't have an archived column, we'll update the category
    const { data: archivedArticles, error: archiveError } = await supabaseAdmin
      .from('articles')
      .update({ 
        category: 'archive',
        updated_at: new Date().toISOString()
      })
      .lt('published_at', cutoffDate.toISOString())
      .eq('is_published', true)
      .neq('category', 'archive')
      .select('id, title');

    if (archiveError) {
      throw archiveError;
    }

    const archivedCount = archivedArticles?.length || 0;
    console.log(`Archived ${archivedCount} articles`);

    // Option 2: Delete very old articles (optional, controlled by parameter)
    let deletedCount = 0;
    if (deleteOld) {
      const veryOldCutoff = new Date();
      veryOldCutoff.setDate(veryOldCutoff.getDate() - (daysOld * 2)); // 2x the archive period

      const { data: deletedArticles, error: deleteError } = await supabaseAdmin
        .from('articles')
        .delete()
        .lt('published_at', veryOldCutoff.toISOString())
        .eq('category', 'archive')
        .select('id');

      if (deleteError) {
        console.error('Error deleting old articles:', deleteError);
      } else {
        deletedCount = deletedArticles?.length || 0;
        console.log(`Deleted ${deletedCount} very old archived articles`);
      }
    }

    // Cleanup rate limits table
    const { error: cleanupError } = await supabaseAdmin.rpc('cleanup_rate_limits');
    if (cleanupError) {
      console.log('Rate limits cleanup skipped:', cleanupError.message);
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        articles_archived: archivedCount,
        articles_deleted: deletedCount,
        cutoff_date: cutoffDate.toISOString()
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error archiving articles:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
