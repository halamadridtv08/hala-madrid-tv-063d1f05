-- Create announcement bar settings table
CREATE TABLE public.announcement_bar (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  message TEXT NOT NULL DEFAULT '',
  emoji TEXT DEFAULT '🚀',
  cta_text TEXT DEFAULT '',
  cta_link TEXT DEFAULT '',
  is_active BOOLEAN DEFAULT false,
  background_color TEXT DEFAULT 'linear-gradient(to right, hsl(240, 10%, 10%), hsl(280, 30%, 15%))',
  text_color TEXT DEFAULT '#ffffff',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.announcement_bar ENABLE ROW LEVEL SECURITY;

-- Allow public read access for active announcements
CREATE POLICY "Anyone can view active announcements"
ON public.announcement_bar
FOR SELECT
USING (is_active = true);

-- Allow admins to manage announcements
CREATE POLICY "Admins can manage announcements"
ON public.announcement_bar
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.admins WHERE id = auth.uid()
  )
);

-- Insert default row
INSERT INTO public.announcement_bar (message, emoji, cta_text, cta_link, is_active)
VALUES ('Bienvenue sur Hala Madrid TV !', '🚀', 'Découvrir', '/', false);