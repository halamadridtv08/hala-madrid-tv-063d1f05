-- Create transfers table for managing transfer news
CREATE TABLE public.transfers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  player_name TEXT NOT NULL,
  player_image TEXT,
  from_team TEXT NOT NULL,
  from_team_logo TEXT,
  to_team TEXT NOT NULL,
  to_team_logo TEXT,
  transfer_type TEXT NOT NULL DEFAULT 'permanent' CHECK (transfer_type IN ('loan', 'permanent', 'free', 'return')),
  transfer_fee TEXT,
  is_official BOOLEAN DEFAULT false,
  is_published BOOLEAN DEFAULT false,
  description TEXT,
  transfer_date DATE,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.transfers ENABLE ROW LEVEL SECURITY;

-- Allow public read access for published transfers
CREATE POLICY "Published transfers are viewable by everyone"
ON public.transfers
FOR SELECT
USING (is_published = true);

-- Allow admins full access (using the admins table pattern)
CREATE POLICY "Admins can manage transfers"
ON public.transfers
FOR ALL
USING (
  EXISTS (SELECT 1 FROM public.admins WHERE id = auth.uid())
);

-- Create trigger for updated_at
CREATE TRIGGER update_transfers_updated_at
BEFORE UPDATE ON public.transfers
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();