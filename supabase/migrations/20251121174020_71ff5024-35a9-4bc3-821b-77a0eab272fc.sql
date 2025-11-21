-- Créer une table pour l'historique des imports de matchs
CREATE TABLE IF NOT EXISTS public.match_import_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id UUID NOT NULL REFERENCES public.matches(id) ON DELETE CASCADE,
  imported_by UUID NOT NULL,
  imported_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  json_data JSONB NOT NULL,
  previous_match_data JSONB NOT NULL,
  previous_stats_data JSONB,
  players_updated INTEGER DEFAULT 0,
  stats_summary JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Activer RLS
ALTER TABLE public.match_import_history ENABLE ROW LEVEL SECURITY;

-- Politique pour les admins
CREATE POLICY "Admins can manage import history"
  ON public.match_import_history
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Créer un index pour améliorer les performances
CREATE INDEX idx_match_import_history_match_id ON public.match_import_history(match_id);
CREATE INDEX idx_match_import_history_imported_at ON public.match_import_history(imported_at DESC);