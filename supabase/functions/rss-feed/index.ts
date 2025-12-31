import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Content-Type": "application/xml; charset=utf-8",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    // Fetch latest published articles
    const { data: articles, error } = await supabaseClient
      .from("articles")
      .select("id, title, description, category, published_at, image_url")
      .eq("is_published", true)
      .order("published_at", { ascending: false })
      .limit(50);

    if (error) {
      console.error("Error fetching articles:", error);
      throw error;
    }

    const siteUrl = "https://hala-madrid-tv.com";
    const feedTitle = "HALA MADRID TV - Actualités Real Madrid";
    const feedDescription = "Toute l'actualité du Real Madrid CF en français - Articles, analyses, matchs et transferts";

    // Generate RSS XML
    const rssItems = (articles || [])
      .map((article) => {
        const pubDate = new Date(article.published_at).toUTCString();
        const link = `${siteUrl}/news/${article.id}`;
        const description = article.description
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;")
          .replace(/"/g, "&quot;")
          .replace(/'/g, "&apos;");
        const title = article.title
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;");

        return `
    <item>
      <title>${title}</title>
      <link>${link}</link>
      <guid isPermaLink="true">${link}</guid>
      <description>${description}</description>
      <category>${article.category}</category>
      <pubDate>${pubDate}</pubDate>
      ${article.image_url ? `<enclosure url="${article.image_url}" type="image/jpeg" />` : ""}
    </item>`;
      })
      .join("");

    const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:media="http://search.yahoo.com/mrss/">
  <channel>
    <title>${feedTitle}</title>
    <link>${siteUrl}</link>
    <description>${feedDescription}</description>
    <language>fr</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${siteUrl}/functions/v1/rss-feed" rel="self" type="application/rss+xml" />
    <image>
      <url>${siteUrl}/favicon.ico</url>
      <title>${feedTitle}</title>
      <link>${siteUrl}</link>
    </image>
    ${rssItems}
  </channel>
</rss>`;

    console.log(`Generated RSS feed with ${articles?.length || 0} articles`);

    return new Response(rss, {
      headers: corsHeaders,
    });
  } catch (error) {
    console.error("RSS feed error:", error);
    return new Response(
      `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Error</title>
    <description>Failed to generate RSS feed</description>
  </channel>
</rss>`,
      {
        status: 500,
        headers: corsHeaders,
      }
    );
  }
});
