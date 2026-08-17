ALTER TABLE public.players ADD COLUMN IF NOT EXISTS squad_type text NOT NULL DEFAULT 'pro';
CREATE INDEX IF NOT EXISTS idx_players_squad_type ON public.players (squad_type);