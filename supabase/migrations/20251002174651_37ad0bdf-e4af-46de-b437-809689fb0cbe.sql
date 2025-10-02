-- Modifier le trigger pour permettre plusieurs joueurs vedettes au lieu d'un seul
DROP TRIGGER IF EXISTS ensure_single_featured_player_trigger ON public.players;
DROP FUNCTION IF EXISTS public.ensure_single_featured_player();

-- Le trigger n'est plus nécessaire car on veut permettre plusieurs joueurs vedettes
-- Les joueurs avec is_featured = true s'afficheront tous dans le carrousel