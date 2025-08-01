-- Fonction pour calculer l'âge automatiquement basé sur la date de naissance
CREATE OR REPLACE FUNCTION calculate_age_from_birth_date()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW."Date de naissance" IS NOT NULL THEN
    NEW.age = EXTRACT(YEAR FROM AGE(NEW."Date de naissance"));
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Déclencheur qui met à jour l'âge à chaque INSERT ou UPDATE
DROP TRIGGER IF EXISTS update_player_age ON players;
CREATE TRIGGER update_player_age
  BEFORE INSERT OR UPDATE ON players
  FOR EACH ROW
  EXECUTE FUNCTION calculate_age_from_birth_date();

-- Fonction pour mettre à jour tous les âges des joueurs (à exécuter périodiquement)
CREATE OR REPLACE FUNCTION update_all_players_ages()
RETURNS void AS $$
BEGIN
  UPDATE players 
  SET age = EXTRACT(YEAR FROM AGE("Date de naissance"))
  WHERE "Date de naissance" IS NOT NULL;
END;
$$ LANGUAGE plpgsql;

-- Mettre à jour tous les âges existants
SELECT update_all_players_ages();