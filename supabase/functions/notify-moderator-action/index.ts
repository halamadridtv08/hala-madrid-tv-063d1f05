import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@4.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface ModeratorActionRequest {
  action_type: 'article_published' | 'flash_news_published';
  entity_id: string;
  entity_title: string;
  moderator_email: string;
}

const ACTION_LABELS: Record<string, string> = {
  article_published: "Article publié",
  flash_news_published: "Flash news publié",
};

const handler = async (req: Request): Promise<Response> => {
  console.log("notify-moderator-action: Request received");

  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Missing Supabase environment variables");
    }

    // Verify authentication via getClaims
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'Authentication required' }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const supabaseClient = createClient(supabaseUrl, Deno.env.get('SUPABASE_ANON_KEY') ?? '', {
      global: { headers: { Authorization: authHeader } }
    });

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid authentication token' }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { 
      action_type, 
      entity_id, 
      entity_title, 
      moderator_email 
    }: ModeratorActionRequest = await req.json();

    console.log(`Processing notification for ${action_type} by ${moderator_email}`);

    // Get admin emails
    const { data: adminEmails, error: emailsError } = await supabase.rpc('get_admin_emails');

    if (emailsError) {
      console.error("Error fetching admin emails:", emailsError);
      throw emailsError;
    }

    if (!adminEmails || adminEmails.length === 0) {
      console.log("No admin emails found, skipping notification");
      return new Response(
        JSON.stringify({ success: true, message: "No admins to notify" }),
        {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    console.log(`Sending notification to ${adminEmails.length} admin(s)`);

    const actionLabel = ACTION_LABELS[action_type] || action_type;
    const viewUrl = action_type === 'article_published' 
      ? `${supabaseUrl.replace('.supabase.co', '.lovable.app')}/news/${entity_id}`
      : `${supabaseUrl.replace('.supabase.co', '.lovable.app')}/admin?tab=flash-news`;

    // Send email to all admins
    const emailResponse = await resend.emails.send({
      from: "HALA MADRID TV <notifications@resend.dev>",
      to: adminEmails,
      subject: `🔔 [Modérateur] ${actionLabel}: ${entity_title}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #1e3a5f 0%, #0f1f30 100%); color: white; padding: 30px; border-radius: 12px 12px 0 0; }
            .header h1 { margin: 0; font-size: 24px; }
            .content { background: #f8f9fa; padding: 30px; border: 1px solid #e9ecef; }
            .info-box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #fbbf24; }
            .info-row { display: flex; margin-bottom: 10px; }
            .info-label { font-weight: 600; width: 120px; color: #666; }
            .info-value { flex: 1; }
            .button { display: inline-block; background: #1e3a5f; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; margin-top: 20px; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔔 Nouvelle action modérateur</h1>
            </div>
            <div class="content">
              <p>Un modérateur a effectué une action qui nécessite votre attention :</p>
              
              <div class="info-box">
                <div class="info-row">
                  <span class="info-label">Action :</span>
                  <span class="info-value"><strong>${actionLabel}</strong></span>
                </div>
                <div class="info-row">
                  <span class="info-label">Titre :</span>
                  <span class="info-value">${entity_title}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Modérateur :</span>
                  <span class="info-value">${moderator_email}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Date :</span>
                  <span class="info-value">${new Date().toLocaleString('fr-FR', { timeZone: 'Europe/Paris' })}</span>
                </div>
              </div>

              <p>Vous pouvez vérifier ce contenu et le modifier si nécessaire.</p>
              
              <a href="${viewUrl}" class="button">Voir le contenu →</a>
            </div>
            <div class="footer">
              <p>HALA MADRID TV - Panel d'administration</p>
              <p>Cette notification a été envoyée automatiquement.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    console.log("Email sent successfully:", emailResponse);

    // Mark the action as notified in the database
    if (entity_id) {
      await supabase
        .from('moderator_actions')
        .update({ notification_sent: true })
        .eq('entity_id', entity_id)
        .eq('action_type', action_type);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Notification sent to ${adminEmails.length} admin(s)` 
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in notify-moderator-action:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
