

## Problemes identifies et plan d'amelioration SEO

Apres audit complet, voici les **problemes critiques** qui empechent le referencement de tes articles :

---

### Probleme 1 — URLs avec UUID (le plus grave)

Actuellement tes articles ont des URLs comme :
`www.hala-madrid-tv.com/news/a3f7b2c1-8d4e-4f5a-9b6c-1234567890ab`

Google **penalise fortement** ces URLs car elles ne contiennent aucun mot-cle. L'URL ideale serait :
`www.hala-madrid-tv.com/news/vinicius-jr-ballon-dor-2025`

**Solution** : Ajouter une colonne `slug` a la table `articles`, generer automatiquement le slug depuis le titre, et modifier les routes pour utiliser le slug au lieu de l'UUID.

---

### Probleme 2 — Domaine incorrect dans le SEO

Le code SEO (`SEOHead.tsx` et `sitemap/index.ts`) utilise `https://halamadridtv.com` comme BASE_URL, mais ton vrai domaine est `https://www.hala-madrid-tv.com`. Resultat : toutes les URLs canoniques, Open Graph, et le sitemap pointent vers un mauvais domaine. Google indexe donc les mauvaises URLs.

**Solution** : Corriger `BASE_URL` partout vers `https://www.hala-madrid-tv.com`.

---

### Probleme 3 — Pas de prerendering (SPA)

Le site est une Single Page Application (SPA) React. Quand Google visite une page, il voit une page blanche avant que le JavaScript s'execute. Google peut executer le JS mais c'est **plus lent et moins fiable** — beaucoup d'articles risquent de ne pas etre indexes correctement.

**Solution** : Ajouter un service de prerendering (comme `prerender.io` ou un middleware Vercel/Edge) qui sert du HTML statique aux robots. Alternative plus simple : ajouter des meta tags dans `index.html` via le plugin `vite-plugin-html` pour au moins avoir le titre/description par defaut.

---

### Probleme 4 — Cache-Control empeche le caching

`index.html` contient `no-cache, no-store, must-revalidate` — cela force le navigateur a retelecharger tout a chaque visite, ralentit le site et penalise le score Core Web Vitals (critere de classement Google).

**Solution** : Retirer ces meta tags agressifs. Vite gere deja le cache-busting avec les hash de fichiers.

---

### Plan d'implementation

**Etape 1 — Corriger les URLs (impact maximal sur le SEO)**
- Ajouter colonne `slug` (text, unique) a la table `articles` via migration SQL
- Generer les slugs pour les articles existants depuis leurs titres
- Modifier `ArticleForm.tsx` pour auto-generer le slug a la creation
- Modifier la route `/news/:id` pour accepter aussi `/news/:slug`
- Modifier `ArticleDetail.tsx` pour chercher par slug ou par id (retro-compatible)
- Ajouter une redirection 301 des anciennes URLs UUID vers les nouvelles URLs slug

**Etape 2 — Corriger le domaine**
- `SEOHead.tsx` : changer `BASE_URL` en `https://www.hala-madrid-tv.com`
- `sitemap/index.ts` : idem
- `robots.txt` : mettre a jour l'URL du sitemap

**Etape 3 — Retirer le cache-control agressif**
- Supprimer les 3 meta tags `Cache-Control`, `Pragma`, `Expires` de `index.html`

**Etape 4 — Ameliorer le sitemap**
- Ajouter `<lastmod>` avec `published_at` aux articles
- Ajouter les matchs et kits dans le sitemap (actuellement les matchs sont fetchees mais pas ajoutees au XML)
- Utiliser les slugs dans les URLs du sitemap

### Fichiers a modifier
- Migration SQL (nouvelle)
- `src/pages/ArticleDetail.tsx`
- `src/components/admin/ArticleForm.tsx`
- `src/components/SEOHead.tsx`
- `supabase/functions/sitemap/index.ts`
- `public/robots.txt`
- `index.html`
- `src/App.tsx` (route)

