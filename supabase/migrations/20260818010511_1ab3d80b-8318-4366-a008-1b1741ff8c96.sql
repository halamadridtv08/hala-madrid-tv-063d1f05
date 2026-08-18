ALTER TABLE public.opposing_teams
  ADD COLUMN IF NOT EXISTS short_name text,
  ADD COLUMN IF NOT EXISTS stadium text,
  ADD COLUMN IF NOT EXISTS is_own_team boolean NOT NULL DEFAULT false;

INSERT INTO public.opposing_teams (name, logo_url, short_name, stadium, is_own_team)
SELECT 'Real Madrid', NULL, 'RMA', 'Santiago Bernabéu', true
WHERE NOT EXISTS (SELECT 1 FROM public.opposing_teams WHERE lower(name) = 'real madrid');