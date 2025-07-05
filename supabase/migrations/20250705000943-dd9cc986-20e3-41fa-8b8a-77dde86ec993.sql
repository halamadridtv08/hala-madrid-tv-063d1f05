
-- Ajouter les colonnes pour les logos des équipes
ALTER TABLE public.matches 
ADD COLUMN home_team_logo TEXT,
ADD COLUMN away_team_logo TEXT;
