-- Add new columns to live_blog_entries for enhanced functionality
ALTER TABLE public.live_blog_entries 
ADD COLUMN IF NOT EXISTS assist_player_id UUID REFERENCES public.players(id),
ADD COLUMN IF NOT EXISTS card_type TEXT CHECK (card_type IN ('yellow', 'red', 'second_yellow')),
ADD COLUMN IF NOT EXISTS card_reason TEXT,
ADD COLUMN IF NOT EXISTS team_side TEXT CHECK (team_side IN ('home', 'away')),
ADD COLUMN IF NOT EXISTS substituted_player_id UUID REFERENCES public.players(id);

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_live_blog_entries_minute ON public.live_blog_entries(minute);
CREATE INDEX IF NOT EXISTS idx_live_blog_entries_entry_type ON public.live_blog_entries(entry_type);