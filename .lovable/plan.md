# Plan : Analytics Dynamique et Géolocalisation

## ✅ Statut : IMPLÉMENTÉ

## Modifications Effectuées

### 1. Edge Function `geo-lookup` ✅
- **Fichier** : `supabase/functions/geo-lookup/index.ts`
- Utilise l'API ip-api.com (gratuite, 45 req/min)
- Récupère l'IP via `x-forwarded-for` ou `x-real-ip`
- Retourne le code pays ISO (FR, ES, NL, etc.)

### 2. Page Tracking avec Géolocalisation ✅
- **Fichier** : `src/hooks/usePageTracking.ts`
- Appelle `geo-lookup` avant chaque insertion dans `page_views`
- Sauvegarde le `country` dans la table

### 3. Analytics Dashboard Dynamique ✅
- **Fichier** : `src/components/admin/AnalyticsDashboard.tsx`
- Articles publiés : affiche "période / total" (ex: "5 / 54")
- Top articles : filtrés par période via `article_view_history`
- Pourcentages géographiques : calculés sur le total des visiteurs par pays

### 4. GeographyMap Corrigé ✅
- **Fichier** : `src/components/admin/analytics/GeographyMap.tsx`
- Filtre les pays "inconnus" de la liste principale
- Affiche un message pour les visiteurs sans localisation
- Pourcentages limités à 100% max

## Résultat

| Problème | Avant | Après |
|----------|-------|-------|
| Articles Publiés | Toujours "10" | "X / Y" (période / total) |
| Top Articles | Tous les temps | Filtré par période sélectionnée |
| Carte géo | "Inconnu 645%" | Pourcentages corrects, "inconnus" séparés |
| Changement période | Données statiques | Rafraîchissement dynamique |
| Géolocalisation | Toujours NULL | Détection automatique du pays |

## Notes Techniques

- Les anciennes entrées `page_views` garderont `country = NULL`
- Les nouvelles visites auront leur pays détecté automatiquement
- L'API GeoIP ajoute ~100-200ms au tracking (en arrière-plan)
