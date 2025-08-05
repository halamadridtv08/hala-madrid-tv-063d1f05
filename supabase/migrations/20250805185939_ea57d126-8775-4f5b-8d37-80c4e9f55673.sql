-- Supprimer les faux joueurs ajoutés précédemment
DELETE FROM public.opposing_players WHERE team_id IN (
  SELECT id FROM public.opposing_teams WHERE name = 'Osasuna'
);