-- Create competition_aliases table for managing competition name normalization
CREATE TABLE IF NOT EXISTS public.competition_aliases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  canonical_name TEXT NOT NULL UNIQUE,
  aliases TEXT[] NOT NULL DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.competition_aliases ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Anyone can view active competition aliases"
  ON public.competition_aliases
  FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage competition aliases"
  ON public.competition_aliases
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Add trigger for updated_at
CREATE TRIGGER update_competition_aliases_updated_at
  BEFORE UPDATE ON public.competition_aliases
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default competition aliases
INSERT INTO public.competition_aliases (canonical_name, aliases) VALUES
  ('UEFA CHAMPIONS LEAGUE', ARRAY['Champions League', 'UCL', 'C1', 'Ligue des Champions']),
  ('LALIGA', ARRAY['La Liga', 'Liga', 'Primera División']),
  ('UEFA EUROPA LEAGUE', ARRAY['Europa League', 'UEL', 'C3']),
  ('COPA DEL REY', ARRAY['Copa del Rey', 'Coupe du Roi']),
  ('SUPERCOPA DE ESPAÑA', ARRAY['Supercoupe d''Espagne', 'Supercopa', 'Spanish Super Cup']),
  ('FIFA CLUB WORLD CUP', ARRAY['Club World Cup', 'Coupe du Monde des Clubs', 'Mundial de Clubes'])
ON CONFLICT (canonical_name) DO NOTHING;

-- Create function to normalize competition names
CREATE OR REPLACE FUNCTION public.normalize_competition_name(input_name TEXT)
RETURNS TEXT
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  v_canonical_name TEXT;
BEGIN
  -- Try to find canonical name from aliases
  SELECT canonical_name INTO v_canonical_name
  FROM public.competition_aliases
  WHERE is_active = true
    AND (
      LOWER(canonical_name) = LOWER(TRIM(input_name))
      OR LOWER(input_name) = ANY(SELECT LOWER(unnest(aliases)))
    )
  LIMIT 1;
  
  -- If found, return canonical name, otherwise return trimmed input
  RETURN COALESCE(v_canonical_name, TRIM(input_name));
END;
$$;