-- Create flash_news_sources table for managing author profiles with avatars
CREATE TABLE IF NOT EXISTS public.flash_news_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  handle TEXT NOT NULL UNIQUE,
  avatar_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.flash_news_sources ENABLE ROW LEVEL SECURITY;

-- Public can view active sources
CREATE POLICY "Anyone can view active sources"
  ON public.flash_news_sources
  FOR SELECT
  USING (is_active = true);

-- Admins and moderators can manage sources
CREATE POLICY "Admins and moderators can manage sources"
  ON public.flash_news_sources
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'moderator'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'moderator'::app_role));

-- Create trigger for updated_at
CREATE TRIGGER update_flash_news_sources_updated_at
  BEFORE UPDATE ON public.flash_news_sources
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default sources
INSERT INTO public.flash_news_sources (name, handle, avatar_url, is_active) VALUES
  ('Fabri', '@fabri', NULL, true),
  ('RMC Sport', '@rmcsport', NULL, true),
  ('L''Équipe', '@lequipe', NULL, true),
  ('Marca', '@marca', NULL, true),
  ('AS', '@diarioas', NULL, true)
ON CONFLICT (handle) DO NOTHING;