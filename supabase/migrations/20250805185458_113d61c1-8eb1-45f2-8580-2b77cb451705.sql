-- Insert Osasuna players based on the provided image
INSERT INTO public.opposing_players (team_id, name, position, jersey_number, is_starter) 
SELECT 
  ot.id,
  player_data.name,
  player_data.position,
  player_data.jersey_number,
  player_data.is_starter
FROM public.opposing_teams ot,
(VALUES 
  ('Ederson', 'GK', 31, true),
  ('Walker', 'RB', 2, true),
  ('Dias', 'CB', 3, true),
  ('Stones', 'CB', 5, true),
  ('Gvardiol', 'LB', 24, true),
  ('Rodri', 'CDM', 16, true),
  ('De Bruyne', 'CM', 17, true),
  ('Silva', 'CM', 20, true),
  ('Foden', 'LW', 47, true),
  ('Grealish', 'RW', 10, true),
  ('Haaland', 'ST', 9, true),
  ('Ortega', 'GK', 18, false),
  ('Lewis', 'LB', 82, false),
  ('Akanji', 'CB', 25, false),
  ('Kovačić', 'CM', 8, false),
  ('Bernardo', 'AM', 20, false),
  ('Doku', 'LW', 11, false),
  ('Álvarez', 'ST', 19, false)
) AS player_data(name, position, jersey_number, is_starter)
WHERE ot.name = 'Osasuna';