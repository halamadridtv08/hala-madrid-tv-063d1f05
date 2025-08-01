-- Correction des fonctions avec search_path sécurisé
DROP FUNCTION IF EXISTS calculate_age_from_birth_date();
DROP FUNCTION IF EXISTS update_all_players_ages();

-- Fonction pour calculer l'âge automatiquement basé sur la date de naissance (version sécurisée)
CREATE OR REPLACE FUNCTION calculate_age_from_birth_date()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW."Date de naissance" IS NOT NULL THEN
    NEW.age = EXTRACT(YEAR FROM AGE(NEW."Date de naissance"));
  END IF;
  RETURN NEW;
END;
$$;

-- Fonction pour mettre à jour tous les âges des joueurs (version sécurisée)
CREATE OR REPLACE FUNCTION update_all_players_ages()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.players 
  SET age = EXTRACT(YEAR FROM AGE("Date de naissance"))
  WHERE "Date de naissance" IS NOT NULL;
END;
$$;

-- Recréer le déclencheur
DROP TRIGGER IF EXISTS update_player_age ON public.players;
CREATE TRIGGER update_player_age
  BEFORE INSERT OR UPDATE ON public.players
  FOR EACH ROW
  EXECUTE FUNCTION calculate_age_from_birth_date();

-- Mettre à jour tous les âges existants
SELECT update_all_players_ages();