import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Verify cron secret for scheduled job authentication
    const cronSecret = Deno.env.get('CRON_SECRET')
    const authHeader = req.headers.get('Authorization')
    
    // Check if request has valid cron secret
    if (authHeader === `Bearer ${cronSecret}` && cronSecret) {
      console.log('Authenticated via CRON_SECRET')
    } else {
      // If no cron secret, verify admin authentication
      const supabaseUrl = Deno.env.get('SUPABASE_URL')!
      const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!
      
      if (!authHeader) {
        console.warn('Unauthorized request: no auth header')
        return new Response(
          JSON.stringify({ error: 'Authentication required' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      const userClient = createClient(supabaseUrl, supabaseAnonKey, {
        global: { headers: { Authorization: authHeader } }
      })

      const { data: { user }, error: authError } = await userClient.auth.getUser()
      
      if (authError || !user) {
        console.warn('Unauthorized request: invalid token')
        return new Response(
          JSON.stringify({ error: 'Invalid authentication' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Verify admin role using service role client
      const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
      const adminClient = createClient(supabaseUrl, supabaseKey)
      
      const { data: roleData } = await adminClient
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'admin')
        .single()

      if (!roleData) {
        console.warn(`Unauthorized request: user ${user.id} is not admin`)
        return new Response(
          JSON.stringify({ error: 'Admin access required' }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      console.log(`Authenticated as admin: ${user.id}`)
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Publier les articles planifiés dont la date est passée
    const { data, error } = await supabase
      .from('articles')
      .update({ is_published: true })
      .lte('scheduled_at', new Date().toISOString())
      .eq('is_published', false)
      .not('scheduled_at', 'is', null)
      .select('id, title')

    if (error) throw error

    console.log(`Published ${data?.length || 0} scheduled articles`)

    return new Response(
      JSON.stringify({ 
        success: true, 
        published: data?.length || 0,
        articles: data 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error publishing scheduled articles:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})