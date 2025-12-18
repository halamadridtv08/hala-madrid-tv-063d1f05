-- Create live_match_bar_settings table for admin control
CREATE TABLE public.live_match_bar_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  active_match_id UUID REFERENCES matches(id) ON DELETE SET NULL,
  is_forced_active BOOLEAN DEFAULT false,
  custom_message TEXT,
  background_image_url TEXT,
  promo_image_url TEXT,
  promo_link TEXT,
  show_scores BOOLEAN DEFAULT true,
  show_timer BOOLEAN DEFAULT true,
  custom_cta_text TEXT,
  custom_cta_link TEXT,
  theme_color TEXT DEFAULT '#1e3a5f',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  updated_by UUID
);

-- Enable RLS
ALTER TABLE public.live_match_bar_settings ENABLE ROW LEVEL SECURITY;

-- Policy: Admins can manage settings
CREATE POLICY "Admins can manage live match bar settings"
ON public.live_match_bar_settings
FOR ALL
USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));

-- Policy: Anyone can view settings (needed for public display)
CREATE POLICY "Anyone can view live match bar settings"
ON public.live_match_bar_settings
FOR SELECT
USING (true);

-- Insert default row so there's always a settings record to update
INSERT INTO public.live_match_bar_settings (id) 
VALUES ('00000000-0000-0000-0000-000000000001');

-- Create trigger for updated_at
CREATE TRIGGER update_live_match_bar_settings_updated_at
BEFORE UPDATE ON public.live_match_bar_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();