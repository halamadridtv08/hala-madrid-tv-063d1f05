-- Table pour les paramètres d'automatisation par match
CREATE TABLE public.match_automation_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id UUID REFERENCES public.matches(id) ON DELETE CASCADE UNIQUE NOT NULL,
  automation_enabled BOOLEAN DEFAULT false,
  api_fixture_id INTEGER,
  scraper_url TEXT,
  last_api_sync TIMESTAMPTZ,
  last_scraper_sync TIMESTAMPTZ,
  auto_timer BOOLEAN DEFAULT true,
  auto_live_blog BOOLEAN DEFAULT true,
  auto_score BOOLEAN DEFAULT true,
  events_synced JSONB DEFAULT '[]'::jsonb,
  last_known_status TEXT,
  last_known_period TEXT,
  sync_errors JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Index pour les matchs avec automatisation activée
CREATE INDEX idx_match_automation_enabled ON public.match_automation_settings(automation_enabled) WHERE automation_enabled = true;

-- Enable RLS
ALTER TABLE public.match_automation_settings ENABLE ROW LEVEL SECURITY;

-- Policy: Admins et modérateurs peuvent tout faire
CREATE POLICY "Admins can manage automation settings" ON public.match_automation_settings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'moderator')
    )
  );

-- Policy: Lecture publique pour les settings actifs (pour le frontend)
CREATE POLICY "Public can view enabled automation" ON public.match_automation_settings
  FOR SELECT USING (automation_enabled = true);

-- Trigger pour updated_at
CREATE TRIGGER update_match_automation_settings_updated_at
  BEFORE UPDATE ON public.match_automation_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for live updates
ALTER PUBLICATION supabase_realtime ADD TABLE public.match_automation_settings;