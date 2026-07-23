
# Archivage sécurisé + Historique carrière style Fotmob

## Objectif
1. Rendre le changement de saison **transactionnel** (tout-ou-rien) côté serveur, pour qu'aucune donnée ne puisse être supprimée sans être archivée d'abord.
2. Afficher sur la fiche publique de chaque joueur **tout son historique par saison** (matchs, buts, passes, cartons, minutes, note moyenne) et par compétition (Liga, C1, Copa, Supercoupes, Mondial des clubs), en pointant sur les tables d'archives.
3. Étendre l'archivage à **toutes les données du club** encore manquantes (transferts, kits, entraînements, conférences de presse, blessés, formations, objectifs joueurs, alertes).

---

## Partie 1 — Archivage transactionnel côté serveur

### Nouvelles tables d'archives (les manquantes)
Créer ces tables avec `season TEXT` + `archived_at` + `original_id` :
- `season_transfers_archive`
- `season_kits_archive`
- `season_training_sessions_archive`
- `season_press_conferences_archive`
- `season_match_absent_players_archive`
- `season_match_formations_archive` (+ `season_match_formation_players_archive`)
- `season_match_lineups_archive`
- `season_probable_lineups_archive`
- `season_player_objectives_archive`
- `season_player_alerts_archive`
- `season_coaches_archive` (snapshot du staff de la saison)
- `season_standings_archive` (classement final Liga si dispo)

Grants complets (SELECT authenticated + public si lecture publique voulue, ALL service_role) et RLS.

### Fonction SQL `public.archive_and_reset_season(p_old_season, p_new_season, p_reset_predictions)`
- `SECURITY DEFINER`, réservée aux admins (`has_role`).
- Wrappe **une seule transaction** : INSERT ... SELECT depuis chaque table active vers son archive, PUIS DELETE, PUIS UPDATE `site_content.current_season`.
- Si une étape échoue → rollback complet, rien n'est perdu.
- Log dans `admin_audit_logs` à la fin.

### Nouvelle Edge Function `archive-season`
- Vérifie JWT admin.
- Appelle la fonction SQL ci-dessus.
- Retourne un résumé (counts par table).

### Refonte `SeasonResetManager.tsx`
- Toujours télécharger le backup JSON localement d'abord (sécurité).
- Remplacer la chaîne de `supabase.from(...).delete()` par un seul appel à `archive-season`.
- Afficher les compteurs de toutes les nouvelles tables archivées.

---

## Partie 2 — Historique carrière style Fotmob sur `PlayerProfile`

### Vue SQL `player_career_by_season`
Union entre `player_stats` (saison en cours) et `season_player_stats_archive` (saisons passées), jointe à `matches` / `season_matches_archive` pour obtenir la compétition et la date. Agrège par (`player_id`, `season`, `competition`) :
- matchs joués, buts, passes, minutes, cartons jaunes/rouges, note moyenne.

Une vue "totaux par saison" (`competition = 'ALL'` calculé) pour la ligne d'en-tête.

### Nouveau composant `PlayerCareerHistory.tsx`
- Onglet **"Carrière"** avec sous-onglets **Club / Saison** (comme Fotmob).
- Tableau : colonnes `Saison / Compétition | MJ | Buts | Passes | Note`.
- Chaque saison est repliable, avec la ligne totale en tête et le détail par compétition en dessous (Liga, C1, Copa, Supercoupes, Mondial des clubs).
- Utilise les logos de compétition déjà présents dans le projet.
- Design cohérent avec la fiche joueur existante.

### Intégration `PlayerProfile.tsx`
Ajouter l'onglet "Carrière" à côté des onglets actuels, chargement lazy pour ne pas alourdir la page.

---

## Partie 3 — Vue admin enrichie

Étendre `SeasonArchiveViewer.tsx` avec des onglets supplémentaires pour les nouvelles tables (transferts, kits, staff, entraînements…), avec export CSV par section.

---

## Sécurité
- Toutes les nouvelles tables d'archives : SELECT public autorisé uniquement sur les données non sensibles (stats, matchs, kits, transferts publiés). Les données admin (alertes, objectifs) restent restreintes aux rôles admin/moderator.
- La fonction `archive_and_reset_season` refuse tout appelant non-admin.
- L'Edge Function valide le JWT et le rôle admin avant tout.

---

## Ordre d'exécution
1. Migration SQL (tables + fonction + vue + RLS + grants).
2. Edge Function `archive-season`.
3. Refonte `SeasonResetManager.tsx`.
4. Composant `PlayerCareerHistory.tsx` + intégration `PlayerProfile.tsx`.
5. Extension `SeasonArchiveViewer.tsx`.

## Ce que tu verras après
- **Fiche joueur publique** : nouvel onglet "Carrière" qui liste toutes les saisons (2024/25, 2025/26, …) avec les stats par compétition, exactement comme sur ta capture Fotmob.
- **Panneau admin "Gestion de la Saison"** : un seul bouton qui archive tout en une transaction sûre — impossible d'avoir des données supprimées sans archive.
- **Panneau "Archives des saisons"** : consultation de toutes les données historiques du club (pas seulement stats/matchs).
