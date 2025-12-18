-- Create match timer settings table for manual timer control
CREATE TABLE public.match_timer_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id UUID REFERENCES public.matches(id) ON DELETE CASCADE UNIQUE,
  timer_started_at TIMESTAMPTZ,
  is_timer_running BOOLEAN DEFAULT false,
  current_half INTEGER DEFAULT 1,
  half_started_at TIMESTAMPTZ,
  first_half_extra_time INTEGER DEFAULT 0,
  second_half_extra_time INTEGER DEFAULT 0,
  is_extra_time BOOLEAN DEFAULT false,
  is_paused BOOLEAN DEFAULT false,
  paused_at_minute INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Add image_url and player_id to live_blog_entries
ALTER TABLE public.live_blog_entries 
ADD COLUMN IF NOT EXISTS image_url TEXT,
ADD COLUMN IF NOT EXISTS player_id UUID REFERENCES public.players(id);

-- Enable RLS on match_timer_settings
ALTER TABLE public.match_timer_settings ENABLE ROW LEVEL SECURITY;

-- Policies for match_timer_settings
CREATE POLICY "Admins can manage match timer settings" 
ON public.match_timer_settings 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Anyone can view match timer settings" 
ON public.match_timer_settings 
FOR SELECT 
USING (true);

-- Enable realtime for match_timer_settings
ALTER PUBLICATION supabase_realtime ADD TABLE public.match_timer_settings;