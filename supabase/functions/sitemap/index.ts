import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Content-Type': 'application/xml',
};

const BASE_URL = 'https://halamadridtv.com';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('Generating sitemap...');

    // Fetch all published content
    const [articlesRes, playersRes, matchesRes, kitsRes] = await Promise.all([
      supabase.from('articles').select('id, updated_at').eq('is_published', true),
      supabase.from('players').select('id, updated_at').eq('is_active', true),
      supabase.from('matches').select('id, updated_at'),
      supabase.from('kits').select('id, updated_at').eq('is_published', true),
    ]);

    const articles = articlesRes.data || [];
    const players = playersRes.data || [];
    const matches = matchesRes.data || [];
    const kits = kitsRes.data || [];

    console.log(`Found: ${articles.length} articles, ${players.length} players, ${matches.length} matches, ${kits.length} kits`);

    // Static pages
    const staticPages = [
      { url: '/', priority: '1.0', changefreq: 'daily' },
      { url: '/news', priority: '0.9', changefreq: 'daily' },
      { url: '/players', priority: '0.8', changefreq: 'weekly' },
      { url: '/matches', priority: '0.8', changefreq: 'daily' },
      { url: '/stats', priority: '0.7', changefreq: 'weekly' },
      { url: '/calendar', priority: '0.7', changefreq: 'weekly' },
      { url: '/training', priority: '0.6', changefreq: 'weekly' },
      { url: '/press', priority: '0.6', changefreq: 'weekly' },
      { url: '/kits', priority: '0.6', changefreq: 'monthly' },
      { url: '/videos', priority: '0.7', changefreq: 'daily' },
    ];

    // Build sitemap XML
    let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

    // Add static pages
    for (const page of staticPages) {
      sitemap += `
  <url>
    <loc>${BASE_URL}${page.url}</loc>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`;
    }

    // Add articles
    for (const article of articles) {
      const lastmod = article.updated_at ? new Date(article.updated_at).toISOString().split('T')[0] : '';
      sitemap += `
  <url>
    <loc>${BASE_URL}/news/${article.id}</loc>
    ${lastmod ? `<lastmod>${lastmod}</lastmod>` : ''}
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;
    }

    // Add players
    for (const player of players) {
      const lastmod = player.updated_at ? new Date(player.updated_at).toISOString().split('T')[0] : '';
      sitemap += `
  <url>
    <loc>${BASE_URL}/players/${player.id}</loc>
    ${lastmod ? `<lastmod>${lastmod}</lastmod>` : ''}
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`;
    }

    sitemap += `
</urlset>`;

    console.log('Sitemap generated successfully');

    return new Response(sitemap, {
      headers: corsHeaders,
      status: 200,
    });
  } catch (error) {
    console.error('Error generating sitemap:', error);
    return new Response(
      `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${BASE_URL}/</loc>
    <priority>1.0</priority>
  </url>
</urlset>`,
      { headers: corsHeaders, status: 200 }
    );
  }
});
