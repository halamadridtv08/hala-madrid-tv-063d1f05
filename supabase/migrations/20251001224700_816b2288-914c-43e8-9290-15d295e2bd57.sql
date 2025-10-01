-- Ajouter la colonne is_featured à la table players
ALTER TABLE public.players 
ADD COLUMN is_featured boolean DEFAULT false;

-- Créer un index pour améliorer les performances de la recherche du joueur vedette
CREATE INDEX idx_players_is_featured ON public.players(is_featured) WHERE is_featured = true;

-- Créer une fonction trigger pour s'assurer qu'un seul joueur peut être vedette à la fois
CREATE OR REPLACE FUNCTION public.ensure_single_featured_player()
RETURNS TRIGGER AS $$
BEGIN
  -- Si le nouveau joueur est marqué comme vedette
  IF NEW.is_featured = true THEN
    -- Retirer le statut vedette de tous les autres joueurs
    UPDATE public.players 
    SET is_featured = false 
    WHERE id != NEW.id AND is_featured = true;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Créer le trigger qui s'exécute avant chaque insertion ou mise à jour
CREATE TRIGGER ensure_single_featured_player_trigger
BEFORE INSERT OR UPDATE OF is_featured ON public.players
FOR EACH ROW
EXECUTE FUNCTION public.ensure_single_featured_player();