import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-cron-secret",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Validate CRON_SECRET for scheduled execution
    const cronSecretRaw = req.headers.get("x-cron-secret") ?? "";
    const cronSecret = cronSecretRaw.trim();
    const expectedSecret = (Deno.env.get("CRON_SECRET") ?? "").trim();

    if (!expectedSecret) {
      console.error("CRON_SECRET not configured in Edge Function secrets");
      return new Response(JSON.stringify({ error: "CRON_SECRET not configured" }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    if (!cronSecret) {
      console.log("Unauthorized: Missing x-cron-secret header");
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    if (cronSecret !== expectedSecret) {
      console.log(
        `Unauthorized: Invalid CRON_SECRET (received_len=${cronSecret.length})`
      );
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    console.log("Starting weekly moderator report generation...");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const resendApiKey = Deno.env.get("RESEND_API_KEY");

    if (!resendApiKey) {
      console.error("RESEND_API_KEY not configured");
      return new Response(JSON.stringify({ error: "Email service not configured" }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const resend = new Resend(resendApiKey);

    // Get date range (last 7 days)
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 7);

    console.log(`Report period: ${startDate.toISOString()} to ${endDate.toISOString()}`);

    // Fetch moderator actions from the last 7 days
    const { data: actions, error: actionsError } = await supabase
      .from("moderator_actions")
      .select("*")
      .gte("created_at", startDate.toISOString())
      .lte("created_at", endDate.toISOString())
      .order("created_at", { ascending: false });

    if (actionsError) {
      console.error("Error fetching moderator actions:", actionsError);
      throw actionsError;
    }

    console.log(`Found ${actions?.length || 0} moderator actions`);

    // Get moderator details
    const moderatorIds = [...new Set(actions?.map(a => a.moderator_id) || [])];
    const { data: moderators } = await supabase
      .from("user_roles")
      .select("user_id, role")
      .in("user_id", moderatorIds);

    // Get moderator emails from auth
    const moderatorEmails: Record<string, string> = {};
    for (const modId of moderatorIds) {
      const { data: userData } = await supabase.auth.admin.getUserById(modId);
      if (userData?.user?.email) {
        moderatorEmails[modId] = userData.user.email;
      }
    }

    // Aggregate statistics
    const stats = {
      totalActions: actions?.length || 0,
      articlesPublished: actions?.filter(a => a.action_type === "article_published").length || 0,
      flashNewsPublished: actions?.filter(a => a.action_type === "flash_news_published").length || 0,
      commentsApproved: actions?.filter(a => a.action_type === "comment_approved").length || 0,
      commentsRejected: actions?.filter(a => a.action_type === "comment_rejected").length || 0,
      playersUpdated: actions?.filter(a => a.action_type === "player_updated").length || 0,
      matchesUpdated: actions?.filter(a => a.action_type === "match_updated").length || 0,
    };

    // Group by moderator
    const byModerator: Record<string, { email: string; count: number; actions: string[] }> = {};
    for (const action of actions || []) {
      if (!byModerator[action.moderator_id]) {
        byModerator[action.moderator_id] = {
          email: moderatorEmails[action.moderator_id] || "Unknown",
          count: 0,
          actions: [],
        };
      }
      byModerator[action.moderator_id].count++;
      if (byModerator[action.moderator_id].actions.length < 5) {
        byModerator[action.moderator_id].actions.push(
          `${action.action_type}: ${action.entity_title || action.entity_type}`
        );
      }
    }

    // Get admin emails
    const { data: adminEmails } = await supabase.rpc("get_admin_emails");
    
    if (!adminEmails || adminEmails.length === 0) {
      console.log("No admin emails found, skipping report");
      return new Response(JSON.stringify({ message: "No admins to notify" }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    console.log(`Sending report to ${adminEmails.length} admins`);

    // Build HTML email
    const moderatorRows = Object.entries(byModerator)
      .map(([_, mod]) => `
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid #eee;">${mod.email}</td>
          <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: center;">${mod.count}</td>
          <td style="padding: 8px; border-bottom: 1px solid #eee; font-size: 12px; color: #666;">
            ${mod.actions.join("<br>")}${mod.count > 5 ? `<br>... et ${mod.count - 5} autres` : ""}
          </td>
        </tr>
      `).join("");

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Rapport Hebdomadaire - Activité Modérateurs</title>
      </head>
      <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
        <div style="background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); color: white; padding: 20px; border-radius: 10px 10px 0 0;">
          <h1 style="margin: 0; font-size: 24px;">📊 Rapport Hebdomadaire</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.8;">Activité des Modérateurs - HalaMadrid TV</p>
          <p style="margin: 5px 0 0 0; font-size: 12px; opacity: 0.6;">
            ${startDate.toLocaleDateString("fr-FR")} - ${endDate.toLocaleDateString("fr-FR")}
          </p>
        </div>
        
        <div style="background: white; padding: 20px; border-radius: 0 0 10px 10px;">
          <h2 style="color: #333; border-bottom: 2px solid #e0e0e0; padding-bottom: 10px;">
            📈 Résumé Global
          </h2>
          
          <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; margin-bottom: 20px;">
            <div style="background: #f0f9ff; padding: 15px; border-radius: 8px; text-align: center;">
              <div style="font-size: 28px; font-weight: bold; color: #0369a1;">${stats.totalActions}</div>
              <div style="font-size: 12px; color: #666;">Actions totales</div>
            </div>
            <div style="background: #f0fdf4; padding: 15px; border-radius: 8px; text-align: center;">
              <div style="font-size: 28px; font-weight: bold; color: #15803d;">${stats.articlesPublished}</div>
              <div style="font-size: 12px; color: #666;">Articles publiés</div>
            </div>
            <div style="background: #fef3c7; padding: 15px; border-radius: 8px; text-align: center;">
              <div style="font-size: 28px; font-weight: bold; color: #b45309;">${stats.flashNewsPublished}</div>
              <div style="font-size: 12px; color: #666;">Flash news publiées</div>
            </div>
            <div style="background: #fce7f3; padding: 15px; border-radius: 8px; text-align: center;">
              <div style="font-size: 28px; font-weight: bold; color: #be185d;">${stats.commentsApproved + stats.commentsRejected}</div>
              <div style="font-size: 12px; color: #666;">Commentaires modérés</div>
            </div>
          </div>

          ${Object.keys(byModerator).length > 0 ? `
            <h2 style="color: #333; border-bottom: 2px solid #e0e0e0; padding-bottom: 10px;">
              👥 Activité par Modérateur
            </h2>
            
            <table style="width: 100%; border-collapse: collapse;">
              <thead>
                <tr style="background: #f5f5f5;">
                  <th style="padding: 10px; text-align: left;">Modérateur</th>
                  <th style="padding: 10px; text-align: center;">Actions</th>
                  <th style="padding: 10px; text-align: left;">Dernières activités</th>
                </tr>
              </thead>
              <tbody>
                ${moderatorRows}
              </tbody>
            </table>
          ` : `
            <p style="text-align: center; color: #666; padding: 20px;">
              Aucune activité de modérateur cette semaine.
            </p>
          `}
          
          <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #eee; text-align: center; color: #999; font-size: 12px;">
            <p>Ce rapport est généré automatiquement chaque semaine.</p>
            <p>HalaMadrid TV - Panel d'administration</p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Send email to all admins
    const { error: emailError } = await resend.emails.send({
      from: "HalaMadrid TV <noreply@halamadrid.tv>",
      to: adminEmails,
      subject: `📊 Rapport Hebdomadaire - ${stats.totalActions} actions modérateurs`,
      html: htmlContent,
    });

    if (emailError) {
      console.error("Error sending email:", emailError);
      // Try with fallback sender - Resend test mode only allows sending to own email
      const fallbackRecipient = "halamadridtv08@gmail.com";
      console.log(`Trying fallback: sending to ${fallbackRecipient} via onboarding@resend.dev`);
      
      const { error: fallbackError } = await resend.emails.send({
        from: "HalaMadrid TV <onboarding@resend.dev>",
        to: [fallbackRecipient],
        subject: `📊 Rapport Hebdomadaire - ${stats.totalActions} actions modérateurs`,
        html: htmlContent,
      });
      
      if (fallbackError) {
        console.error("Fallback email also failed:", fallbackError);
        throw fallbackError;
      }
      
      console.log("Weekly report sent successfully via fallback!");
      return new Response(
        JSON.stringify({
          success: true,
          stats,
          emailsSent: 1,
          fallback: true,
          note: "Email sent to fallback address. Verify halamadrid.tv domain in Resend for full functionality.",
          period: {
            start: startDate.toISOString(),
            end: endDate.toISOString(),
          },
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    console.log("Weekly report sent successfully!");

    return new Response(
      JSON.stringify({
        success: true,
        stats,
        emailsSent: adminEmails.length,
        period: {
          start: startDate.toISOString(),
          end: endDate.toISOString(),
        },
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error generating weekly report:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
});
