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