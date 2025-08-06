-- Supprimer les équipes adverses créées automatiquement
DELETE FROM public.opposing_teams WHERE name IN ('Atlético Madrid', 'FC Barcelone', 'Osasuna');