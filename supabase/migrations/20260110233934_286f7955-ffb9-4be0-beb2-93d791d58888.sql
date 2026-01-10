-- Create table for sound settings
CREATE TABLE public.sound_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  is_enabled BOOLEAN DEFAULT true,
  
  -- Son de bienvenue
  welcome_sound_enabled BOOLEAN DEFAULT true,
  welcome_sound_url_fr TEXT,
  welcome_sound_url_en TEXT,
  
  -- Son de connexion
  login_sound_enabled BOOLEAN DEFAULT true,
  login_sound_url_fr TEXT,
  login_sound_url_en TEXT,
  
  -- Son de déconnexion
  logout_sound_enabled BOOLEAN DEFAULT true,
  logout_sound_url_fr TEXT,
  logout_sound_url_en TEXT,
  
  -- Paramètres généraux
  volume DECIMAL DEFAULT 0.5,
  auto_language_detection BOOLEAN DEFAULT true,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.sound_settings ENABLE ROW LEVEL SECURITY;

-- Public read access (everyone can read sound settings)
CREATE POLICY "Sound settings are publicly readable"
ON public.sound_settings
FOR SELECT
USING (true);

-- Only admins can update sound settings
CREATE POLICY "Only admins can update sound settings"
ON public.sound_settings
FOR UPDATE
USING (
  EXISTS (SELECT 1 FROM public.admins WHERE id = auth.uid())
);

-- Only admins can insert sound settings
CREATE POLICY "Only admins can insert sound settings"
ON public.sound_settings
FOR INSERT
WITH CHECK (
  EXISTS (SELECT 1 FROM public.admins WHERE id = auth.uid())
);

-- Insert default row
INSERT INTO public.sound_settings (id) VALUES (gen_random_uuid());

-- Create storage bucket for sounds
INSERT INTO storage.buckets (id, name, public) 
VALUES ('sounds', 'sounds', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for sounds bucket
CREATE POLICY "Sound files are publicly accessible"
ON storage.objects
FOR SELECT
USING (bucket_id = 'sounds');

CREATE POLICY "Admins can upload sounds"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'sounds' 
  AND EXISTS (SELECT 1 FROM public.admins WHERE id = auth.uid())
);

CREATE POLICY "Admins can update sounds"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'sounds' 
  AND EXISTS (SELECT 1 FROM public.admins WHERE id = auth.uid())
);

CREATE POLICY "Admins can delete sounds"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'sounds' 
  AND EXISTS (SELECT 1 FROM public.admins WHERE id = auth.uid())
);