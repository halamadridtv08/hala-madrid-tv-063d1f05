ALTER TABLE public.coaches
  ADD COLUMN IF NOT EXISTS birth_date TEXT,
  ADD COLUMN IF NOT EXISTS at_club_since TEXT;