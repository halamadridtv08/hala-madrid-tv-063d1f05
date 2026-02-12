import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

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

// Translate content from Spanish to French using DeepL
async function translateToFrench(texts: string[], supabase: any): Promise<string[]> {
  if (texts.length === 0) return texts;

  try {
    // Get DeepL API key from integrations table
    const { data: integration } = await supabase
      .from('integrations')
      .select('config, is_enabled')
      .eq('integration_key', 'deepl')
      .single();

    if (!integration?.is_enabled || !integration?.config?.api_key) {
      console.warn('DeepL not configured or disabled, skipping translation');
      return texts;
    }

    const apiKey = integration.config.api_key;
    const apiUrl = apiKey.endsWith(':fx') 
      ? 'https://api-free.deepl.com/v2/translate'
      : 'https://api.deepl.com/v2/translate';

    // Batch translate (DeepL supports multiple texts in one call)
    const formData = new URLSearchParams();
    texts.forEach(text => formData.append('text', text));
    formData.append('source_lang', 'ES');
    formData.append('target_lang', 'FR');

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `DeepL-Auth-Key ${apiKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString(),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('DeepL translation error:', response.status, errorText);
      return texts; // Return original texts on error
    }

    const data = await response.json();
    return data.translations.map((t: any) => t.text);
  } catch (error) {
    console.error('Translation failed:', error);
    return texts; // Return original texts on error
  }
}

// Translate titles from Spanish to French
function translateTitle(type: string): string {
  const titleMap: Record<string, string> = {
    'goal': 'BUT !',
    'red_card': 'CARTON ROUGE',
    'yellow_card': 'CARTON JAUNE',
    'substitution': 'REMPLACEMENT',
    'var': 'VAR',
    'penalty': 'PENALTY',
    'halftime': 'MI-TEMPS',
    'fulltime': 'FIN DU MATCH',
    'kickoff': 'COUP D\'ENVOI',
    'injury': 'Blessure',
    'update': 'Mise à jour',
  };
  return titleMap[type] || 'Mise à jour';
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
  // Goals
  if (/\b(goal|gol|but|⚽|golazo|marca)\b/i.test(content)) {
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
  if (/\b(substitution|changement|sustituci[oó]n|cambio|🔄|↔|↩|↪|entra|sale)\b/i.test(content)) {
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
  if (/\b(half[-\s]?time|mi[-\s]?temps|descanso)\b/i.test(content)) {
    return { type: 'halftime', title: 'MI-TEMPS', isImportant: false };
  }
  
  // Full-time
  if (/\b(full[-\s]?time|fin du match|final del partido)\b/i.test(content)) {
    return { type: 'fulltime', title: 'FIN DU MATCH', isImportant: false };
  }
  
  // Kick-off
  if (/\b(kick[-\s]?off|coup d'envoi|inicio|empieza|comienza)\b/i.test(content)) {
    return { type: 'kickoff', title: 'COUP D\'ENVOI', isImportant: false };
  }
  
  // Injury
  if (/\b(injury|blessure|lesi[oó]n|🏥|injured)\b/i.test(content)) {
    return { type: 'injury', title: 'Blessure', isImportant: false };
  }
  
  // Default update
  return { type: 'update', title: 'Mise à jour', isImportant: false };
}

// Check if content should be completely skipped
function shouldSkipContent(content: string): boolean {
  const lowerContent = content.toLowerCase();
  
  // Skip pure markdown image syntax
  if (/^\!\[.*\]\(https?:\/\//i.test(content.trim())) {
    return true;
  }
  
  // Skip pure markdown link syntax (just a link, nothing else)
  if (/^\[.*\]\(https?:\/\/.*\)$/i.test(content.trim())) {
    return true;
  }
  
  // Skip CDN/asset URLs
  if (/monterosa\.cloud|cdn\.|assets\./i.test(content)) {
    return true;
  }
  
  // Skip "View post on X" type entries
  if (/view post on|visit this post|ver publicación/i.test(lowerContent)) {
    return true;
  }
  
  // Skip Twitter Embed markers
  if (/^twitter embed$/i.test(content.trim())) {
    return true;
  }
  
  // Skip FanKit entries
  if (/^fankit$/i.test(content.trim())) {
    return true;
  }
  
  // Skip "Más información" links
  if (/^(\[)?más información/i.test(content.trim())) {
    return true;
  }
  
  // Skip entries that are mostly URLs (>60%)
  const urlMatches = content.match(/https?:\/\/[^\s\)\]]+/g) || [];
  const urlLength = urlMatches.reduce((sum, url) => sum + url.length, 0);
  if (urlLength > content.length * 0.6) {
    return true;
  }
  
  // Skip very short content
  if (content.replace(/[^a-záéíóúñA-ZÁÉÍÓÚÑ]/g, '').length < 10) {
    return true;
  }
  
  // Skip entries that are just team names or scores
  if (/^(real madrid|betis|barcelona|atletico|[\d\s\-:]+)$/i.test(content.trim())) {
    return true;
  }

  return false;
}

// Check if content is a meaningful match update
function isMeaningfulContent(content: string): boolean {
  // Has a player name pattern (capitalized words)
  const hasPlayerName = /[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+/.test(content);
  
  // Has match-related keywords
  const hasMatchKeywords = /\b(gol|goal|but|card|tarjeta|carton|substit|cambio|corner|falta|foul|tiro|shot|parada|save|oportunidad|chance|occasion|penal|var|medio|half|tiempo|minute|min|victoria|win|derrota|defeat|empate|draw|balón|ball|portería|keeper|defensa|defense|ataque|attack|pase|pass|jugada|play)\b/i.test(content);
  
  // Has minute reference
  const hasMinute = /\d{1,3}[''′]/.test(content);
  
  // Content is long enough to be meaningful
  const isLongEnough = content.length > 30;
  
  return (hasPlayerName && (hasMatchKeywords || hasMinute)) || (isLongEnough && hasMatchKeywords);
}

// Clean content by removing markdown syntax
function cleanContent(content: string): string {
  return content
    // Remove markdown links but keep text: [text](url) -> text
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    // Remove image syntax
    .replace(/!\[[^\]]*\]\([^)]+\)/g, '')
    // Remove extra whitespace
    .replace(/\s+/g, ' ')
    .trim();
}

// Parse scraped content into live blog entries
function parseEntries(markdown: string): LiveBlogEntry[] {
  const entries: LiveBlogEntry[] = [];
  const seenContent = new Set<string>();
  
  // Split by double newlines to get paragraphs/sections
  const sections = markdown.split(/\n{2,}/).filter(s => s.trim().length > 15);
  
  for (const section of sections) {
    // Also split by single newlines within sections
    const lines = section.split(/\n/).filter(l => l.trim().length > 10);
    
    for (const line of lines) {
      let cleanLine = line.trim();
      
      // Skip headers
      if (cleanLine.startsWith('#')) continue;
      
      // Skip content that should be filtered
      if (shouldSkipContent(cleanLine)) {
        continue;
      }
      
      // Clean the content
      cleanLine = cleanContent(cleanLine);
      
      // Skip if cleaned content is too short
      if (cleanLine.length < 20) continue;
      
      // Check if it's meaningful match content
      if (!isMeaningfulContent(cleanLine)) {
        continue;
      }
      
      // Extract minute if present
      const minuteMatch = cleanLine.match(/^(\d{1,3})[''′]?\s*[-–—:]?\s*/);
      let minute: number | null = null;
      let content = cleanLine;
      
      if (minuteMatch) {
        const parsedMinute = parseInt(minuteMatch[1], 10);
        if (parsedMinute >= 0 && parsedMinute <= 120) {
          minute = parsedMinute;
          content = cleanLine.slice(minuteMatch[0].length).trim();
        }
      } else {
        // Try to find minute pattern anywhere
        const anyMinuteMatch = cleanLine.match(/\b(\d{1,3})[''′]/);
        if (anyMinuteMatch) {
          const parsedMinute = parseInt(anyMinuteMatch[1], 10);
          if (parsedMinute >= 0 && parsedMinute <= 120) {
            minute = parsedMinute;
          }
        }
      }
      
      // Skip if content is too short
      if (content.length < 15) continue;
      
      // Skip duplicates
      const normalizedContent = content.toLowerCase().replace(/\s+/g, ' ').substring(0, 80);
      if (seenContent.has(normalizedContent)) continue;
      seenContent.add(normalizedContent);
      
      const { type, title, isImportant } = detectEntryType(content);
      
      // Determine team side
      let teamSide: 'home' | 'away' | null = null;
      if (/real madrid|blancos|merengue/i.test(content)) {
        teamSide = 'home';
      }
      
      entries.push({
        minute,
        entry_type: type,
        title,
        content: content.substring(0, 500),
        is_important: isImportant,
        team_side: teamSide,
      });
    }
  }
  
  return entries;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify authentication via getClaims
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ success: false, error: 'Authentication required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? '';
    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    const token = authHeader.replace('Bearer ', '');
    const { data: claimsData, error: claimsError } = await supabaseClient.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid authentication token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

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

    let formattedUrl = url.trim();
    if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
      formattedUrl = `https://${formattedUrl}`;
    }

    console.log('Scraping live blog URL:', formattedUrl);

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
        waitFor: 5000,
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
    console.log('Content preview:', markdown.substring(0, 1000));

    const parsedEntries = parseEntries(markdown);
    
    console.log('Parsed entries count:', parsedEntries.length);
    
    // Return success with 0 entries if none found (not an error - match may not have started)
    if (parsedEntries.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          entriesImported: 0,
          message: 'No new match events found. The live blog may not have started yet.',
          entries: []
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // TRANSLATION: Translate Spanish content to French
    console.log('Translating content from Spanish to French...');
    const contentsToTranslate = parsedEntries.map(e => e.content);
    const translatedContents = await translateToFrench(contentsToTranslate, supabase);
    console.log('Translation completed');

    // Build entries with translated content and proper French titles
    const entriesToInsert = parsedEntries.map((entry, index) => ({
      match_id,
      minute: entry.minute,
      entry_type: entry.entry_type,
      title: translateTitle(entry.entry_type), // Use French title based on type
      content: translatedContents[index] || entry.content, // Translated content
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
        entries: insertedData,
        translated: true
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
