const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface LiveBlogEntry {
  minute: number | null;
  entry_type: string;
  title: string;
  content: string;
  is_important: boolean;
  team_side: 'home' | 'away' | null;
}

// Parse minute from text like "45'" or "90+3'"
function parseMinute(text: string): number | null {
  const match = text.match(/(\d+)(?:\+(\d+))?[''′]?/);
  if (match) {
    const base = parseInt(match[1], 10);
    const extra = match[2] ? parseInt(match[2], 10) : 0;
    return base + extra;
  }
  return null;
}

// Detect entry type from content
function detectEntryType(content: string): { type: string; title: string; isImportant: boolean } {
  const lowerContent = content.toLowerCase();
  
  // Goals
  if (/\b(goal|gol|but|⚽|golazo)\b/i.test(content)) {
    return { type: 'goal', title: 'BUT !', isImportant: true };
  }
  
  // Red cards
  if (/\b(red card|carton rouge|tarjeta roja|🟥|expulsado|expulsion)\b/i.test(content)) {
    return { type: 'red_card', title: 'CARTON ROUGE', isImportant: true };
  }
  
  // Yellow cards
  if (/\b(yellow card|carton jaune|tarjeta amarilla|🟨|amonestado)\b/i.test(content)) {
    return { type: 'yellow_card', title: 'CARTON JAUNE', isImportant: false };
  }
  
  // Substitutions
  if (/\b(substitution|changement|sustituci[oó]n|cambio|🔄|in:|out:|↔|↩|↪|entra|sale)\b/i.test(content)) {
    return { type: 'substitution', title: 'REMPLACEMENT', isImportant: false };
  }
  
  // VAR
  if (/\b(var|video assistant|📺)\b/i.test(content)) {
    return { type: 'var', title: 'VAR', isImportant: true };
  }
  
  // Penalty
  if (/\b(penalty|penal|penalti|p[eé]nalty)\b/i.test(content)) {
    return { type: 'penalty', title: 'PENALTY', isImportant: true };
  }
  
  // Half-time
  if (/\b(half[-\s]?time|mi[-\s]?temps|descanso|ht|mt)\b/i.test(content)) {
    return { type: 'halftime', title: 'MI-TEMPS', isImportant: false };
  }
  
  // Full-time
  if (/\b(full[-\s]?time|fin du match|final del partido|ft)\b/i.test(content)) {
    return { type: 'fulltime', title: 'FIN DU MATCH', isImportant: false };
  }
  
  // Kick-off
  if (/\b(kick[-\s]?off|coup d'envoi|inicio|empieza)\b/i.test(content)) {
    return { type: 'kickoff', title: 'COUP D\'ENVOI', isImportant: false };
  }
  
  // Injury
  if (/\b(injury|blessure|lesi[oó]n|🏥|injured)\b/i.test(content)) {
    return { type: 'injury', title: 'Blessure', isImportant: false };
  }
  
  // Default comment
  return { type: 'comment', title: 'Commentaire', isImportant: false };
}

// Check if content is a social media/spam comment to skip
function isSocialMediaOrSpam(content: string): boolean {
  const lowerContent = content.toLowerCase();
  
  // Skip Instagram/Twitter/social media links and embeds
  if (/instagram\.com|twitter\.com|x\.com|facebook\.com|tiktok\.com/i.test(content)) {
    return true;
  }
  
  // Skip image/media only entries with no real content
  if (/^\!\[.*\]\(https?:\/\/cdn\.|^\[.*likes?\]|^\[view all.*comments\]/i.test(content)) {
    return true;
  }
  
  // Skip reaction/emoji only entries
  if (/^\!\[(heart|blowmind|fire|clap|like|wow)\]/i.test(content)) {
    return true;
  }
  
  // Skip monterosa.cloud CDN assets (reaction images)
  if (/monterosa\.cloud/i.test(content)) {
    return true;
  }
  
  // Skip entries that are just numbers or very short
  if (/^[\d\s\-\:\.\,]+$/.test(content.trim())) {
    return true;
  }
  
  // Skip "view all X comments" type entries
  if (/view all \d+ comments|ver todos los|voir tous les/i.test(content)) {
    return true;
  }
  
  return false;
}

// Check if content looks like a real match event
function isMatchEvent(content: string): boolean {
  const eventPatterns = [
    /\b(goal|gol|but|⚽|golazo|marca|scores?)\b/i,
    /\b(yellow|red|card|carton|tarjeta|🟨|🟥)\b/i,
    /\b(substit|cambio|changement|reemplaz|🔄|entra|sale|on for|off for)\b/i,
    /\b(kick[-\s]?off|coup d'envoi|inicio|empieza|arranca)\b/i,
    /\b(half[-\s]?time|mi[-\s]?temps|descanso|entretiempo)\b/i,
    /\b(full[-\s]?time|fin|final|termina|over)\b/i,
    /\b(var|video assistant|penalt|penal)\b/i,
    /\b(corner|falta|foul|offside|fuera de juego|hors-jeu)\b/i,
    /\b(save|saves?|parada|arrêt|portero|keeper)\b/i,
    /\b(shot|tiro|frappe|disparo|chance|occasion)\b/i,
    /\b(header|cabeza|tête|cross|centro|pase)\b/i,
    /\b(free[-\s]?kick|coup franc|tiro libre)\b/i,
    /\b(injury|bless|lesión|injured|down|hurt)\b/i,
    /\b(extra[-\s]?time|prolongation|prórroga|added time|stoppage)\b/i,
    /\b(whistle|referee|arbitro|árbitro)\b/i,
    /\d+[''′]\s*[-–—]?\s*\w+/i, // Minute followed by text (e.g., "45' - Goal")
  ];
  
  return eventPatterns.some(pattern => pattern.test(content));
}

// Parse scraped content into live blog entries
function parseEntries(markdown: string): LiveBlogEntry[] {
  const entries: LiveBlogEntry[] = [];
  const seenContent = new Set<string>(); // Avoid duplicates
  
  // Split by common delimiters (newlines, bullets, numbered lists)
  const lines = markdown.split(/\n+/).filter(line => line.trim().length > 10);
  
  for (const line of lines) {
    const cleanLine = line.trim();
    
    // Skip headers, navigation elements, and short lines
    if (cleanLine.startsWith('#') || cleanLine.length < 20) continue;
    
    // Skip social media and spam content
    if (isSocialMediaOrSpam(cleanLine)) {
      continue;
    }
    
    // Only keep actual match events
    if (!isMatchEvent(cleanLine)) {
      continue;
    }
    
    // Try to extract minute from the beginning of the line
    const minuteMatch = cleanLine.match(/^(\d+)[''′]?\s*[-–—:]?\s*/);
    let minute: number | null = null;
    let content = cleanLine;
    
    if (minuteMatch) {
      minute = parseInt(minuteMatch[1], 10);
      content = cleanLine.slice(minuteMatch[0].length).trim();
    } else {
      // Try to find minute anywhere in the line
      const anyMinute = parseMinute(cleanLine);
      if (anyMinute !== null && anyMinute <= 120) {
        minute = anyMinute;
      }
    }
    
    // Skip if content is too short after extracting minute
    if (content.length < 15) continue;
    
    // Skip duplicates (normalize for comparison)
    const normalizedContent = content.toLowerCase().replace(/\s+/g, ' ').substring(0, 100);
    if (seenContent.has(normalizedContent)) continue;
    seenContent.add(normalizedContent);
    
    const { type, title, isImportant } = detectEntryType(content);
    
    // Determine team side based on content
    let teamSide: 'home' | 'away' | null = null;
    if (/real madrid|los blancos|madrid|merengues/i.test(content)) {
      teamSide = 'home';
    }
    
    entries.push({
      minute,
      entry_type: type,
      title,
      content: content.substring(0, 500), // Limit content length
      is_important: isImportant,
      team_side: teamSide,
    });
  }
  
  return entries;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { url, match_id } = await req.json();

    if (!url) {
      return new Response(
        JSON.stringify({ success: false, error: 'URL is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!match_id) {
      return new Response(
        JSON.stringify({ success: false, error: 'match_id is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const apiKey = Deno.env.get('FIRECRAWL_API_KEY');
    if (!apiKey) {
      console.error('FIRECRAWL_API_KEY not configured');
      return new Response(
        JSON.stringify({ success: false, error: 'Firecrawl connector not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Format URL
    let formattedUrl = url.trim();
    if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
      formattedUrl = `https://${formattedUrl}`;
    }

    console.log('Scraping live blog URL:', formattedUrl);

    // Scrape with Firecrawl
    const scrapeResponse = await fetch('https://api.firecrawl.dev/v1/scrape', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: formattedUrl,
        formats: ['markdown'],
        onlyMainContent: true,
        waitFor: 3000, // Wait for dynamic content
      }),
    });

    const scrapeData = await scrapeResponse.json();

    if (!scrapeResponse.ok || !scrapeData.success) {
      console.error('Firecrawl error:', scrapeData);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: scrapeData.error || `Scraping failed with status ${scrapeResponse.status}` 
        }),
        { status: scrapeResponse.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const markdown = scrapeData.data?.markdown || scrapeData.markdown || '';
    
    if (!markdown) {
      return new Response(
        JSON.stringify({ success: false, error: 'No content found on the page' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Scraped content length:', markdown.length);

    // Parse entries from markdown
    const parsedEntries = parseEntries(markdown);
    
    if (parsedEntries.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'No live blog entries could be extracted from the page',
          rawContentPreview: markdown.substring(0, 500)
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Parsed entries:', parsedEntries.length);

    // Insert entries into database
    const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2');
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const entriesToInsert = parsedEntries.map(entry => ({
      match_id,
      minute: entry.minute,
      entry_type: entry.entry_type,
      title: entry.title,
      content: entry.content,
      is_important: entry.is_important,
      team_side: entry.team_side,
    }));

    const { data: insertedData, error: insertError } = await supabase
      .from('live_blog_entries')
      .insert(entriesToInsert)
      .select();

    if (insertError) {
      console.error('Database insert error:', insertError);
      return new Response(
        JSON.stringify({ success: false, error: `Database error: ${insertError.message}` }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Inserted entries:', insertedData?.length || 0);

    return new Response(
      JSON.stringify({ 
        success: true, 
        entriesImported: insertedData?.length || 0,
        entries: insertedData
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in scrape-live-blog:', error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
