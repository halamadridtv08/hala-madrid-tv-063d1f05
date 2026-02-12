

# Plan : Renforcement de la Securite Globale du Site

## Audit de securite - Problemes identifies

L'analyse de securite a revele plusieurs vulnerabilites importantes a corriger en priorite.

---

## PRIORITE 1 : Politiques RLS trop permissives (CRITIQUE)

**Probleme** : Plusieurs tables d'administration sont modifiables par N'IMPORTE QUEL utilisateur connecte, pas seulement les admins. Un simple utilisateur inscrit pourrait modifier le branding, les liens de navigation, le contenu du site, etc.

**Tables concernees** :

| Table | Risque |
|-------|--------|
| `branding_settings` | Un utilisateur peut changer le logo, les couleurs du site |
| `explore_cards` | Modification des cartes de la page Explorer |
| `navigation_links` | Injection de liens malveillants dans la navigation |
| `site_content` | Modification du contenu du site (CGU, etc.) |
| `social_links` | Modification des liens vers les reseaux sociaux |
| `welcome_popup_settings` | Modification du popup de bienvenue |
| `kits` | Ajout de faux kits |
| `player_stats` | N'importe qui peut inserer des stats joueurs |

**Correction** : Remplacer toutes ces politiques `WITH CHECK (true)` / `USING (true)` par des verifications de role admin/moderateur via `has_role(auth.uid(), 'admin')` ou `has_role(auth.uid(), 'moderator')`.

---

## PRIORITE 2 : Edge Functions avec verify_jwt = true (deprece)

**Probleme** : 3 Edge Functions utilisent `verify_jwt = true` dans `config.toml`, ce qui est l'approche deprecee et ne fonctionne pas avec le systeme signing-keys de Supabase.

**Fonctions concernees** :
- `sync-match-details`
- `send-push-notification`
- `notify-moderator-action`
- `scrape-live-blog`

**Correction** : Passer a `verify_jwt = false` et valider le JWT manuellement dans le code avec `getClaims()`.

---

## PRIORITE 3 : XSS dans WelcomePopup

**Probleme** : Le composant `WelcomePopup.tsx` utilise `dangerouslySetInnerHTML` avec `settings.title` sans sanitisation DOMPurify. Si un admin compromis injecte du HTML malveillant dans le titre, tous les visiteurs seront affectes.

**Correction** : Ajouter `DOMPurify.sanitize()` autour du contenu.

---

## PRIORITE 4 : Rate limiting sur les commentaires et votes

**Probleme** : Les tables `article_comments`, `poll_votes`, `dream_teams` et `page_views` acceptent des INSERT de n'importe qui (`WITH CHECK (true)` pour le role `public`). Sans rate limiting cote base de donnees, un attaquant peut spammer massivement.

**Correction** : Ajouter un rate limiting via la fonction `check_rate_limit` existante dans les fonctions d'insertion (via trigger ou RPC).

---

## PRIORITE 5 : Headers de securite renforces (Vercel)

**Probleme** : Le fichier `vercel.json` ne contient que 2 headers basiques. Il manque des headers critiques.

**Correction** : Ajouter les headers manquants :
- `Content-Security-Policy` (reprise de l'index.html)
- `Strict-Transport-Security`
- `Referrer-Policy`
- `Permissions-Policy`

---

## Details techniques de l'implementation

### Migration SQL (Priorite 1)

```sql
-- Supprimer les politiques trop permissives et les remplacer par des verifications admin

-- branding_settings
DROP POLICY IF EXISTS "Authenticated users can insert branding_settings" ON branding_settings;
DROP POLICY IF EXISTS "Authenticated users can update branding_settings" ON branding_settings;
DROP POLICY IF EXISTS "Authenticated users can delete branding_settings" ON branding_settings;

CREATE POLICY "Admins can manage branding" ON branding_settings
  FOR ALL USING (has_role(auth.uid(), 'admin'))
  WITH CHECK (has_role(auth.uid(), 'admin'));

-- (meme pattern pour explore_cards, navigation_links, site_content,
--  social_links, welcome_popup_settings, kits, player_stats)
```

### Fichiers a modifier

| Fichier | Modification |
|---------|--------------|
| Migration SQL | Corriger ~18 politiques RLS sur 8 tables |
| `supabase/config.toml` | Passer 4 fonctions a `verify_jwt = false` |
| `supabase/functions/sync-match-details/index.ts` | Ajouter validation JWT manuelle |
| `supabase/functions/send-push-notification/index.ts` | Ajouter validation JWT manuelle |
| `supabase/functions/notify-moderator-action/index.ts` | Ajouter validation JWT manuelle |
| `supabase/functions/scrape-live-blog/index.ts` | Ajouter validation JWT manuelle |
| `src/components/welcome/WelcomePopup.tsx` | Ajouter DOMPurify |
| `vercel.json` | Ajouter headers de securite |

### Recapitulatif des corrections

| Categorie | Nombre de corrections | Severite |
|-----------|----------------------|----------|
| RLS trop permissives (tables admin) | ~18 politiques sur 8 tables | CRITIQUE |
| Edge Functions JWT deprece | 4 fonctions | HAUTE |
| XSS WelcomePopup | 1 composant | MOYENNE |
| Headers Vercel | 1 fichier | MOYENNE |

