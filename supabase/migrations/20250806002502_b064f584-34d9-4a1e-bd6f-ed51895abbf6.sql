-- Ajouter une colonne pour lier les matchs aux équipes adverses
ALTER TABLE public.matches 
ADD COLUMN opposing_team_id uuid REFERENCES public.opposing_teams(id);

-- Créer les équipes adverses basées sur les matchs existants
INSERT INTO public.opposing_teams (name, logo_url)
SELECT DISTINCT 
  CASE 
    WHEN away_team != 'Real Madrid' THEN away_team
    ELSE home_team
  END as name,
  CASE 
    WHEN away_team != 'Real Madrid' THEN away_team_logo
    ELSE home_team_logo
  END as logo_url
FROM public.matches
WHERE 
  (away_team != 'Real Madrid' OR home_team != 'Real Madrid')
  AND NOT EXISTS (
    SELECT 1 FROM public.opposing_teams ot 
    WHERE ot.name = CASE 
      WHEN away_team != 'Real Madrid' THEN away_team
      ELSE home_team
    END
  );

-- Mettre à jour les matchs existants avec l'ID de l'équipe adverse
UPDATE public.matches 
SET opposing_team_id = ot.id
FROM public.opposing_teams ot
WHERE 
  (matches.away_team != 'Real Madrid' AND ot.name = matches.away_team)
  OR (matches.home_team != 'Real Madrid' AND ot.name = matches.home_team);