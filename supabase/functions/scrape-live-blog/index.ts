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

// ============================================================
// TRANSLATION HELPERS
// ============================================================

async function translateToFrench(texts: string[], supabase: any): Promise<string[]> {
  if (texts.length === 0) return texts;
  try {
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
      console.error('DeepL translation error:', response.status, await response.text());
      return texts;
    }

    const data = await response.json();
    return data.translations.map((t: any) => t.text);
  } catch (error) {
    console.error('Translation failed:', error);
    return texts;
  }
}

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
    'assist': 'PASSE DÉCISIVE',
    'highlight': 'MOMENT FORT',
    'corner': 'CORNER',
  };
  return titleMap[type] || 'Mise à jour';
}

// ============================================================
// FOTMOB PARSER  — content is already in French
// ============================================================

function isFotmobUrl(url: string): boolean {
  return /fotmob\.com/i.test(url);
}

function parseFotmobEntries(markdown: string): LiveBlogEntry[] {
  const entries: LiveBlogEntry[] = [];
  const seenContent = new Set<string>();

  // Split into lines
  const lines = markdown.split('\n');

  let i = 0;
  while (i < lines.length) {
    const line = lines[i].trim();

    // Detect minute lines like "45+4‎'‎" or "31‎'‎" or "5‎'‎"
    // FotMob uses special unicode chars around the apostrophe
    const minuteMatch = line.match(/^(\d{1,3})(?:\+(\d+))?[\u200e\u200f]*[''′'][\u200e\u200f]*$/);

    if (minuteMatch) {
      const base = parseInt(minuteMatch[1], 10);
      const extra = minuteMatch[2] ? parseInt(minuteMatch[2], 10) : 0;
      const minute = base + extra;

      // Look ahead for event type and content
      let eventType = 'update';
      let title = 'Mise à jour';
      let isImportant = false;
      let contentLines: string[] = [];
      let j = i + 1;

      // Skip empty lines
      while (j < lines.length && lines[j].trim() === '') j++;

      // Check if next non-empty line is an event type marker
      if (j < lines.length) {
        const nextLine = lines[j].trim();

        if (/^but\s*!?$/i.test(nextLine)) {
          eventType = 'goal'; title = 'BUT !'; isImportant = true; j++;
        } else if (/^carton jaune$/i.test(nextLine)) {
          eventType = 'yellow_card'; title = 'CARTON JAUNE'; isImportant = false; j++;
        } else if (/^carton rouge$/i.test(nextLine)) {
          eventType = 'red_card'; title = 'CARTON ROUGE'; isImportant = true; j++;
        } else if (/^passe d[eé]cisive$/i.test(nextLine)) {
          eventType = 'assist'; title = 'PASSE DÉCISIVE'; isImportant = false; j++;
        } else if (/^moment fort$/i.test(nextLine)) {
          eventType = 'highlight'; title = 'MOMENT FORT'; isImportant = true; j++;
        } else if (/^remplacement$/i.test(nextLine)) {
          eventType = 'substitution'; title = 'REMPLACEMENT'; isImportant = false; j++;
        } else if (/mi-temps/i.test(nextLine)) {
          eventType = 'halftime'; title = 'MI-TEMPS'; isImportant = false;
          // Use the line itself as content
          contentLines.push(nextLine); j++;
        } else if (/penalty/i.test(nextLine)) {
          eventType = 'penalty'; title = 'PENALTY'; isImportant = true; j++;
        }
      }

      // Now collect content lines until next minute marker or end
      while (j < lines.length) {
        const cl = lines[j].trim();

        // Stop at next minute marker
        if (/^\d{1,3}(?:\+\d+)?[\u200e\u200f]*[''′'][\u200e\u200f]*$/.test(cl)) break;

        // Skip player card blocks (images, team logos)
        if (cl.startsWith('[![') || cl.startsWith('![') || cl.startsWith('\\')) { j++; continue; }

        // Skip emoji reaction lines (e.g. "🔥10🥳4🏳️2" or "👑1 916🔥779")
        if (/^[\p{Emoji}\p{Emoji_Component}\d\s,]+$/u.test(cl) && cl.length < 80) { j++; continue; }

        // Skip xG/shot type lines
        if (/^(Type de tir|xG|xGOT)/i.test(cl)) { j++; continue; }

        // Skip empty lines
        if (cl === '') { j++; continue; }

        // Skip lines that are just player info (number + name + position)
        if (/^\d{1,2}[A-Z][a-zà-ü]/.test(cl) && cl.length < 40) { j++; continue; }

        // Skip position labels
        if (/^(Attaquant|Défenseur|Milieu|Gardien)/i.test(cl) && cl.length < 30) { j++; continue; }

        // This is actual content
        contentLines.push(cl);
        j++;
      }

      // Build content string
      let content = contentLines
        .map(l => l.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')) // remove markdown links
        .map(l => l.replace(/!\[[^\]]*\]\([^)]+\)/g, ''))   // remove images
        .map(l => l.replace(/\\\\/g, '').trim())
        .filter(l => l.length > 10)
        .join(' ')
        .replace(/\s+/g, ' ')
        .trim();

      if (content.length < 15) { i = j; continue; }

      // Dedup
      const key = content.toLowerCase().substring(0, 80);
      if (seenContent.has(key)) { i = j; continue; }
      seenContent.add(key);

      // Detect team side from content
      let teamSide: 'home' | 'away' | null = null;
      if (/real madrid|los blancos|merengue|madrid/i.test(content)) teamSide = 'home';

      entries.push({
        minute,
        entry_type: eventType,
        title,
        content: content.substring(0, 500),
        is_important: isImportant,
        team_side: teamSide,
      });

      i = j;
    } else {
      i++;
    }
  }

  // Also extract the halftime/fulltime summary paragraph (long text without minute)
  const summaryMatch = markdown.match(/Le coup de sifflet.*?(?=\n\n[🔥❌😩]|\n\n\d{1,3}[\u200e])/s);
  if (summaryMatch) {
    const summaryContent = summaryMatch[0].replace(/\s+/g, ' ').trim();
    if (summaryContent.length > 50) {
      const key = summaryContent.toLowerCase().substring(0, 80);
      if (!seenContent.has(key)) {
        seenContent.add(key);
        entries.push({
          minute: 45,
          entry_type: 'halftime',
          title: 'MI-TEMPS',
          content: summaryContent.substring(0, 500),
          is_important: false,
          team_side: null,
        });
      }
    }
  }

  // Also extract pre-match lineups
  const lineupPatterns = [
    /REAL MADRID \([^)]+\)\s*:\s*[^.]+/i,
    /REAL SOCIEDAD \([^)]+\)\s*:\s*[^.]+/i,
  ];
  for (const pattern of lineupPatterns) {
    const match = markdown.match(pattern);
    if (match) {
      const lineupContent = match[0].replace(/\s+/g, ' ').trim();
      const key = lineupContent.toLowerCase().substring(0, 80);
      if (!seenContent.has(key) && lineupContent.length > 30) {
        seenContent.add(key);
        const isHome = /real madrid/i.test(lineupContent);
        entries.push({
          minute: 0,
          entry_type: 'kickoff',
          title: 'COMPOSITION',
          content: lineupContent.substring(0, 500),
          is_important: false,
          team_side: isHome ? 'home' : 'away',
        });
      }
    }
  }

  return entries;
}

// ============================================================
// GENERIC (Real Madrid site) PARSER — existing logic
// ============================================================

function detectEntryType(content: string): { type: string; title: string; isImportant: boolean } {
  if (/\b(goal|gol|but|⚽|golazo|marca)\b/i.test(content))
    return { type: 'goal', title: 'BUT !', isImportant: true };
  if (/\b(red card|carton rouge|tarjeta roja|🟥|expulsado|expulsion)\b/i.test(content))
    return { type: 'red_card', title: 'CARTON ROUGE', isImportant: true };
  if (/\b(yellow card|carton jaune|tarjeta amarilla|🟨|amonestado)\b/i.test(content))
    return { type: 'yellow_card', title: 'CARTON JAUNE', isImportant: false };
  if (/\b(substitution|changement|sustituci[oó]n|cambio|🔄|↔|↩|↪|entra|sale)\b/i.test(content))
    return { type: 'substitution', title: 'REMPLACEMENT', isImportant: false };
  if (/\b(var|video assistant|📺)\b/i.test(content))
    return { type: 'var', title: 'VAR', isImportant: true };
  if (/\b(penalty|penal|penalti|p[eé]nalty)\b/i.test(content))
    return { type: 'penalty', title: 'PENALTY', isImportant: true };
  if (/\b(half[-\s]?time|mi[-\s]?temps|descanso)\b/i.test(content))
    return { type: 'halftime', title: 'MI-TEMPS', isImportant: false };
  if (/\b(full[-\s]?time|fin du match|final del partido)\b/i.test(content))
    return { type: 'fulltime', title: 'FIN DU MATCH', isImportant: false };
  if (/\b(kick[-\s]?off|coup d'envoi|inicio|empieza|comienza)\b/i.test(content))
    return { type: 'kickoff', title: 'COUP D\'ENVOI', isImportant: false };
  if (/\b(injury|blessure|lesi[oó]n|🏥|injured)\b/i.test(content))
    return { type: 'injury', title: 'Blessure', isImportant: false };
  return { type: 'update', title: 'Mise à jour', isImportant: false };
}

function shouldSkipContent(content: string): boolean {
  const lowerContent = content.toLowerCase();
  if (/^\!\[.*\]\(https?:\/\//i.test(content.trim())) return true;
  if (/^\[.*\]\(https?:\/\/.*\)$/i.test(content.trim())) return true;
  if (/monterosa\.cloud|cdn\.|assets\./i.test(content)) return true;
  if (/view post on|visit this post|ver publicación/i.test(lowerContent)) return true;
  if (/^twitter embed$/i.test(content.trim())) return true;
  if (/^fankit$/i.test(content.trim())) return true;
  if (/^(\[)?más información/i.test(content.trim())) return true;
  const urlMatches = content.match(/https?:\/\/[^\s\)\]]+/g) || [];
  const urlLength = urlMatches.reduce((sum, url) => sum + url.length, 0);
  if (urlLength > content.length * 0.6) return true;
  if (content.replace(/[^a-záéíóúñA-ZÁÉÍÓÚÑ]/g, '').length < 10) return true;
  if (/^(real madrid|betis|barcelona|atletico|[\d\s\-:]+)$/i.test(content.trim())) return true;
  return false;
}

function isMeaningfulContent(content: string): boolean {
  const hasPlayerName = /[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+/.test(content);
  const hasMatchKeywords = /\b(gol|goal|but|card|tarjeta|carton|substit|cambio|corner|falta|foul|tiro|shot|parada|save|oportunidad|chance|occasion|penal|var|medio|half|tiempo|minute|min|victoria|win|derrota|defeat|empate|draw|balón|ball|portería|keeper|defensa|defense|ataque|attack|pase|pass|jugada|play)\b/i.test(content);
  const hasMinute = /\d{1,3}[''′]/.test(content);
  const isLongEnough = content.length > 30;
  return (hasPlayerName && (hasMatchKeywords || hasMinute)) || (isLongEnough && hasMatchKeywords);
}

function cleanContent(content: string): string {
  return content
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/!\[[^\]]*\]\([^)]+\)/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function parseGenericEntries(markdown: string): LiveBlogEntry[] {
  const entries: LiveBlogEntry[] = [];
  const seenContent = new Set<string>();
  const sections = markdown.split(/\n{2,}/).filter(s => s.trim().length > 15);

  for (const section of sections) {
    const lines = section.split(/\n/).filter(l => l.trim().length > 10);
    for (const line of lines) {
      let cleanLine = line.trim();
      if (cleanLine.startsWith('#')) continue;
      if (shouldSkipContent(cleanLine)) continue;
      cleanLine = cleanContent(cleanLine);
      if (cleanLine.length < 20) continue;
      if (!isMeaningfulContent(cleanLine)) continue;

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
        const anyMinuteMatch = cleanLine.match(/\b(\d{1,3})[''′]/);
        if (anyMinuteMatch) {
          const parsedMinute = parseInt(anyMinuteMatch[1], 10);
          if (parsedMinute >= 0 && parsedMinute <= 120) minute = parsedMinute;
        }
      }

      if (content.length < 15) continue;
      const normalizedContent = content.toLowerCase().replace(/\s+/g, ' ').substring(0, 80);
      if (seenContent.has(normalizedContent)) continue;
      seenContent.add(normalizedContent);

      const { type, title, isImportant } = detectEntryType(content);
      let teamSide: 'home' | 'away' | null = null;
      if (/real madrid|blancos|merengue/i.test(content)) teamSide = 'home';

      entries.push({
        minute, entry_type: type, title,
        content: content.substring(0, 500),
        is_important: isImportant, team_side: teamSide,
      });
    }
  }
  return entries;
}

// ============================================================
// MAIN HANDLER
// ============================================================

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
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

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
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
      return new Response(
        JSON.stringify({ success: false, error: 'Firecrawl connector not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let formattedUrl = url.trim();
    if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
      formattedUrl = `https://${formattedUrl}`;
    }

    // Detect source type
    const isFotmob = isFotmobUrl(formattedUrl);
    console.log(`Scraping ${isFotmob ? 'FotMob' : 'generic'} live blog:`, formattedUrl);

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
      const errorMsg = scrapeData.error || `Scraping failed with status ${scrapeResponse.status}`;
      console.error('Firecrawl error detail:', errorMsg);
      return new Response(
        JSON.stringify({
          success: false,
          error: errorMsg
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
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
    console.log('Content preview:', markdown.substring(0, 500));

    // Use appropriate parser
    const parsedEntries = isFotmob
      ? parseFotmobEntries(markdown)
      : parseGenericEntries(markdown);

    console.log('Parsed entries count:', parsedEntries.length);

    if (parsedEntries.length === 0) {
      return new Response(
        JSON.stringify({
          success: true,
          entriesImported: 0,
          message: 'No new match events found. The live blog may not have started yet.',
          entries: [],
          source: isFotmob ? 'fotmob' : 'generic',
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Service role client for DB writes
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, serviceKey);

    let finalEntries: typeof parsedEntries;

    if (isFotmob) {
      // FotMob content is already in French — no translation needed
      console.log('FotMob source detected — content already in French, skipping translation');
      finalEntries = parsedEntries;
    } else {
      // Generic source (Real Madrid site) — translate from Spanish
      console.log('Translating content from Spanish to French...');
      const contentsToTranslate = parsedEntries.map(e => e.content);
      const translatedContents = await translateToFrench(contentsToTranslate, supabase);
      finalEntries = parsedEntries.map((entry, index) => ({
        ...entry,
        content: translatedContents[index] || entry.content,
        title: translateTitle(entry.entry_type),
      }));
      console.log('Translation completed');
    }

    const entriesToInsert = finalEntries.map(entry => ({
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
        entries: insertedData,
        source: isFotmob ? 'fotmob' : 'generic',
        translated: !isFotmob,
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
