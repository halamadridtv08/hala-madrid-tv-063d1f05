
# Plan : Analytics Dynamique et Géolocalisation

## Problèmes Identifiés

### 1. Articles Publiés (Onglet Contenu)
- **Actuel** : Affiche `data.topArticles.length` (max 10 car limité par la requête)
- **Attendu** : Afficher le nombre d'articles publiés dans la période + le total global

### 2. Vues/Données incohérentes lors du changement de période
- **Cause** : Les statistiques de contenu (articles, vues moyennes) ne sont pas filtrées par date
- La requête `topArticles` récupère les 10 articles les plus vus *de tous les temps*, pas de la période sélectionnée

### 3. Carte Géographique - "Inconnu" à 645%
- **Cause** : La colonne `country` dans `page_views` est toujours `NULL` (3024/3024 lignes)
- **Solution** : Créer une Edge Function GeoIP pour enrichir le pays lors de l'insertion

### 4. Calcul du pourcentage incorrect
- Le pourcentage dépasse 100% car il divise par `uniqueVisitors` au lieu du `total des visiteurs par pays`

## Architecture de la Solution

```text
┌─────────────────────────────────────────────────────────────────┐
│                    FRONTEND (AnalyticsDashboard)                │
├─────────────────────────────────────────────────────────────────┤
│  - Requêtes filtrées par période (periodStart → now)           │
│  - Articles publiés : comptage par published_at dans période   │
│  - Refetch automatique sur changement de période               │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    EDGE FUNCTION (geo-lookup)                    │
├─────────────────────────────────────────────────────────────────┤
│  - Appelée par le client lors du tracking                       │
│  - Récupère l'IP (via header x-forwarded-for)                   │
│  - Appelle ipapi.co (gratuit, 30k/mois) ou ip-api.com (45k/min) │
│  - Retourne le code pays ISO (FR, ES, US, etc.)                 │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    SUPABASE (page_views)                         │
├─────────────────────────────────────────────────────────────────┤
│  - Colonne `country` remplie via la réponse de geo-lookup       │
│  - Analytics lisent les données agrégées par pays               │
└─────────────────────────────────────────────────────────────────┘
```

## Modifications Détaillées

### Étape 1 : Créer l'Edge Function `geo-lookup`

**Fichier** : `supabase/functions/geo-lookup/index.ts`

L'API ip-api.com est gratuite (45 requêtes/minute sans clé). Elle retourne le code pays ISO directement.

```typescript
// Endpoint: GET /geo-lookup
// Headers: x-forwarded-for ou x-real-ip
// Response: { country_code: "FR" }

const corsHeaders = { /* ... */ };

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });
  
  // Récupérer l'IP du client
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() 
           || req.headers.get('x-real-ip') 
           || null;
  
  if (!ip || ip === '127.0.0.1' || ip.startsWith('192.168.')) {
    return new Response(JSON.stringify({ country_code: null }), { headers: corsHeaders });
  }
  
  // Appeler ip-api.com (gratuit, pas de clé requise)
  const geoRes = await fetch(`http://ip-api.com/json/${ip}?fields=countryCode`);
  const geoData = await geoRes.json();
  
  return new Response(JSON.stringify({ 
    country_code: geoData.countryCode || null 
  }), { headers: corsHeaders });
});
```

### Étape 2 : Modifier `usePageTracking.ts`

Appeler l'Edge Function pour obtenir le pays avant d'insérer dans `page_views`.

```typescript
// Nouvelle logique dans trackPageView()
const getCountryCode = async (): Promise<string | null> => {
  try {
    const res = await fetch(`https://qjnppcfbywfazwolfppo.supabase.co/functions/v1/geo-lookup`, {
      headers: { 'Content-Type': 'application/json' }
    });
    const data = await res.json();
    return data.country_code || null;
  } catch {
    return null;
  }
};

// Dans trackPageView :
const countryCode = await getCountryCode();

await supabase.from('page_views').insert({
  // ... autres champs
  country: countryCode, // Nouveau : rempli dynamiquement
});
```

### Étape 3 : Corriger AnalyticsDashboard.tsx

#### 3.1 Comptage dynamique des articles publiés dans la période

```typescript
// Nouvelle requête pour compter les articles publiés dans la période
const { count: articlesInPeriod } = await supabase
  .from('articles')
  .select('*', { count: 'exact', head: true })
  .eq('is_published', true)
  .gte('published_at', periodStart.toISOString());

const { count: totalArticles } = await supabase
  .from('articles')
  .select('*', { count: 'exact', head: true })
  .eq('is_published', true);
```

#### 3.2 Top articles de la période (pas de tous les temps)

```typescript
// Filtrer les articles vus dans la période via article_view_history
const { data: articleViewsInPeriod } = await supabase
  .from('article_view_history')
  .select('article_id')
  .gte('created_at', periodStart.toISOString());

// Compter les vues par article
const viewCounts: Record<string, number> = {};
articleViewsInPeriod?.forEach(v => {
  viewCounts[v.article_id] = (viewCounts[v.article_id] || 0) + 1;
});

// Récupérer les détails des top articles
const topArticleIds = Object.entries(viewCounts)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 10)
  .map(([id]) => id);

const { data: topArticlesData } = await supabase
  .from('articles')
  .select('id, title, category, view_count')
  .in('id', topArticleIds);

// Enrichir avec les vues de la période
const topArticles = topArticlesData?.map(a => ({
  ...a,
  period_views: viewCounts[a.id] || 0
})).sort((a, b) => b.period_views - a.period_views) || [];
```

#### 3.3 Corriger le calcul des pourcentages géographiques

```typescript
// AVANT (incorrect) :
percentage: uniqueVisitors > 0 ? (visitors / uniqueVisitors) * 100 : 0

// APRÈS (correct) :
const totalCountryVisitors = Object.values(countryCounts).reduce((a, b) => a + b, 0);
percentage: totalCountryVisitors > 0 ? (visitors / totalCountryVisitors) * 100 : 0
```

### Étape 4 : Ajouter les nouveaux champs au state

```typescript
interface AnalyticsData {
  // ... existants
  articlesInPeriod: number;      // Nouveau
  totalArticlesPublished: number; // Nouveau
  topArticlesPeriod: Array<{     // Modifié
    id: string; 
    title: string; 
    category: string; 
    view_count: number;
    period_views: number;        // Nouveau
  }>;
}
```

### Étape 5 : Mettre à jour l'UI (Onglet Contenu)

```typescript
// Carte "Articles Publiés" - afficher les deux chiffres
<AnalyticsStatCard
  title="Articles Publiés"
  value={`${data.articlesInPeriod} / ${data.totalArticlesPublished}`}
  icon={<FileText className="h-5 w-5" />}
  iconBgColor="bg-emerald-500/10"
  iconColor="text-emerald-500"
/>

// TopContentTable - utiliser period_views
<TopContentTable 
  articles={data.topArticlesPeriod.map(a => ({
    ...a,
    view_count: a.period_views // Afficher les vues de la période
  }))} 
/>
```

### Étape 6 : Améliorer GeographyMap

Gérer le cas "Inconnu" de façon élégante et corriger les pourcentages.

```typescript
// Dans GeographyMap.tsx
const countryStats = data.filter(c => c.code !== 'unknown');
const unknownCount = data.find(c => c.code === 'unknown')?.visitors || 0;

// Afficher un message si beaucoup de données inconnues
{unknownCount > 0 && (
  <p className="text-xs text-muted-foreground mt-2">
    {unknownCount} visiteur(s) avec localisation inconnue
  </p>
)}
```

## Fichiers à Modifier

| Fichier | Description |
|---------|-------------|
| `supabase/functions/geo-lookup/index.ts` | **Nouveau** - Edge Function GeoIP |
| `supabase/config.toml` | Ajouter config pour geo-lookup |
| `src/hooks/usePageTracking.ts` | Appeler geo-lookup pour obtenir le pays |
| `src/components/admin/AnalyticsDashboard.tsx` | Requêtes filtrées par période + nouveaux champs |
| `src/components/admin/analytics/TopContentTable.tsx` | Afficher vues de la période |
| `src/components/admin/analytics/GeographyMap.tsx` | Corriger pourcentages + affichage |

## Résultat Attendu

| Problème | Avant | Après |
|----------|-------|-------|
| Articles Publiés | Toujours "10" | "5 / 54" (période / total) |
| Top Articles | Tous les temps | Filtré par période |
| Carte géo | "Inconnu 645%" | "France 45%, Espagne 30%..." |
| Changement période | Données statiques | Rafraîchissement dynamique |

## Notes Techniques

- **API GeoIP** : ip-api.com est gratuite pour usage non-commercial (45 req/min)
- **Cache** : Les anciennes entrées `page_views` garderont `country = NULL`
- **Performances** : L'appel GeoIP ajoute ~100-200ms au tracking, mais est fait en arrière-plan
