-- 1. Live Blog table for real-time match updates
CREATE TABLE public.live_blog_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  match_id UUID NOT NULL REFERENCES public.matches(id) ON DELETE CASCADE,
  minute INTEGER,
  entry_type TEXT NOT NULL DEFAULT 'update',
  title TEXT,
  content TEXT NOT NULL,
  is_important BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  author_id UUID
);

-- Enable RLS
ALTER TABLE public.live_blog_entries ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Anyone can view live blog entries"
ON public.live_blog_entries FOR SELECT
USING (true);

CREATE POLICY "Admins can manage live blog entries"
ON public.live_blog_entries FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Enable realtime for live updates
ALTER PUBLICATION supabase_realtime ADD TABLE public.live_blog_entries;

-- 2. Newsletter Subscribers table
CREATE TABLE public.newsletter_subscribers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  name TEXT,
  subscription_type TEXT NOT NULL DEFAULT 'weekly',
  is_active BOOLEAN DEFAULT true,
  subscribed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  unsubscribed_at TIMESTAMP WITH TIME ZONE,
  confirmation_token TEXT,
  is_confirmed BOOLEAN DEFAULT false,
  confirmed_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- RLS Policies (public can subscribe, only admins manage)
CREATE POLICY "Anyone can subscribe to newsletter"
ON public.newsletter_subscribers FOR INSERT
WITH CHECK (true);

CREATE POLICY "Admins can view all subscribers"
ON public.newsletter_subscribers FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can manage subscribers"
ON public.newsletter_subscribers FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Subscribers can unsubscribe themselves via token
CREATE POLICY "Subscribers can update their own subscription"
ON public.newsletter_subscribers FOR UPDATE
USING (true)
WITH CHECK (true);

-- 3. Dream Team Builder table
CREATE TABLE public.dream_teams (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  team_name TEXT NOT NULL DEFAULT 'Mon XI de rêve',
  formation TEXT NOT NULL DEFAULT '4-3-3',
  players JSONB NOT NULL DEFAULT '[]'::jsonb,
  total_budget_used NUMERIC DEFAULT 0,
  share_token TEXT UNIQUE,
  likes_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.dream_teams ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Anyone can view shared dream teams"
ON public.dream_teams FOR SELECT
USING (share_token IS NOT NULL OR user_id = auth.uid());

CREATE POLICY "Anyone can create dream teams"
ON public.dream_teams FOR INSERT
WITH CHECK (true);

CREATE POLICY "Users can update their own dream teams"
ON public.dream_teams FOR UPDATE
USING (user_id = auth.uid() OR user_id IS NULL);

CREATE POLICY "Users can delete their own dream teams"
ON public.dream_teams FOR DELETE
USING (user_id = auth.uid());

-- 4. Player budget values for dream team builder
ALTER TABLE public.players ADD COLUMN IF NOT EXISTS market_value NUMERIC DEFAULT 50;

-- Trigger for updated_at
CREATE TRIGGER update_live_blog_entries_updated_at
BEFORE UPDATE ON public.live_blog_entries
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_dream_teams_updated_at
BEFORE UPDATE ON public.dream_teams
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();