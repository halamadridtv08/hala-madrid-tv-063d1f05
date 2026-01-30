
# Plan de Correction : Sécurité du Leaderboard

## Résumé du Problème

Le scanner de sécurité détecte que la table `prediction_leaderboard` contient une colonne `user_email`. Même si cette colonne n'est pas exposée dans la vue publique actuelle, sa simple existence représente un risque de sécurité.

## Analyse Actuelle

| Élément | État |
|---------|------|
| Table `prediction_leaderboard` | Contient `user_email` (jamais remplie) |
| Vue `prediction_leaderboard_public` | N'expose PAS `user_email` |
| `security_invoker` | Activé sur la vue |
| RLS | Activé avec politiques admin |
| Fonction de calcul | N'utilise pas `user_email` |

## Solution Simplifiée

Plutôt que d'utiliser le script complexe de Claude.ai (319 lignes), je propose une solution adaptée à votre projet existant :

### Étape 1 : Modifications de la Base de Données

```sql
-- 1. Ajouter la colonne display_name pour les pseudonymes
ALTER TABLE prediction_leaderboard 
ADD COLUMN IF NOT EXISTS display_name TEXT;

-- 2. Générer des pseudonymes pour les entrées existantes
UPDATE prediction_leaderboard
SET display_name = 'Madridista_' || SUBSTRING(user_id::TEXT FROM 1 FOR 6)
WHERE display_name IS NULL;

-- 3. Trigger pour auto-générer display_name sur insertion
CREATE OR REPLACE FUNCTION generate_leaderboard_display_name()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.display_name IS NULL THEN
    NEW.display_name := 'Madridista_' || SUBSTRING(NEW.user_id::TEXT FROM 1 FOR 6);
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_generate_leaderboard_display_name ON prediction_leaderboard;
CREATE TRIGGER trg_generate_leaderboard_display_name
  BEFORE INSERT ON prediction_leaderboard
  FOR EACH ROW
  EXECUTE FUNCTION generate_leaderboard_display_name();

-- 4. Supprimer la colonne user_email (jamais utilisée)
ALTER TABLE prediction_leaderboard DROP COLUMN IF EXISTS user_email;

-- 5. Recréer la vue publique avec display_name
DROP VIEW IF EXISTS prediction_leaderboard_public;

CREATE VIEW prediction_leaderboard_public
WITH (security_invoker=on) AS
SELECT 
    id,
    user_id,
    display_name,
    total_points,
    correct_scores,
    correct_outcomes,
    total_predictions,
    current_streak,
    best_streak,
    created_at,
    updated_at
FROM prediction_leaderboard
ORDER BY total_points DESC NULLS LAST;

GRANT SELECT ON prediction_leaderboard_public TO anon, authenticated;
```

### Étape 2 : Mise à jour du Frontend

**Fichier : `src/hooks/useMatchPredictions.ts`**
- Mettre à jour l'interface `LeaderboardEntry` pour inclure `display_name`

**Fichier : `src/components/predictions/PredictionLeaderboard.tsx`**
- Afficher `display_name` au lieu de `Player ${user_id.slice(0,6)}`

**Fichier : `src/components/home/MatchPredictionsWidget.tsx`**
- Utiliser `display_name` pour les badges du mini-leaderboard

### Changements Frontend Détaillés

```typescript
// useMatchPredictions.ts - Interface mise à jour
export interface LeaderboardEntry {
  id: string;
  user_id: string;
  display_name: string;  // Nouveau champ
  total_points: number;
  correct_scores: number;
  correct_outcomes: number;
  total_predictions: number;
  current_streak: number;
  best_streak: number;
}

// PredictionLeaderboard.tsx - Affichage
<p className="font-medium">
  {entry.display_name || `Madridista_${entry.user_id.slice(0, 6)}`}
  {entry.user_id === user?.id && (
    <Badge variant="outline" className="ml-2 text-xs">Vous</Badge>
  )}
</p>

// MatchPredictionsWidget.tsx - Mini leaderboard
<Badge>
  {index + 1}. {entry.display_name || `Madridista_${entry.user_id.slice(0, 4)}`} ({entry.total_points}pts)
</Badge>
```

## Avantages de cette Approche

| Aspect | Script Claude.ai | Cette Solution |
|--------|------------------|----------------|
| Complexité | 319 lignes | ~50 lignes |
| Colonnes ajoutées | 2 (display_name, show_public_name) | 1 (display_name) |
| Fonctions | 3 nouvelles fonctions | 1 trigger |
| Tables | 1 table de logs ajoutée | Aucune |
| Compatibilité | Nécessite adaptations | Compatible directement |

## Résultat Attendu

- La colonne `user_email` sera supprimée
- Les utilisateurs auront un pseudonyme `Madridista_XXXXXX`
- Le scanner de sécurité ne détectera plus de problème
- L'affichage sera plus convivial avec des pseudonymes
