-- Create page_views table for tracking all page visits
CREATE TABLE public.page_views (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  page_path TEXT NOT NULL,
  page_title TEXT,
  visitor_id TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  referrer TEXT,
  user_agent TEXT,
  device_type TEXT,
  browser TEXT,
  country TEXT,
  session_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create article_view_history table for detailed article tracking
CREATE TABLE public.article_view_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  article_id UUID NOT NULL REFERENCES public.articles(id) ON DELETE CASCADE,
  visitor_id TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes for better query performance
CREATE INDEX idx_page_views_created_at ON public.page_views(created_at DESC);
CREATE INDEX idx_page_views_visitor_id ON public.page_views(visitor_id);
CREATE INDEX idx_page_views_page_path ON public.page_views(page_path);
CREATE INDEX idx_page_views_user_id ON public.page_views(user_id);

CREATE INDEX idx_article_view_history_created_at ON public.article_view_history(created_at DESC);
CREATE INDEX idx_article_view_history_article_id ON public.article_view_history(article_id);
CREATE INDEX idx_article_view_history_visitor_id ON public.article_view_history(visitor_id);

-- Enable RLS
ALTER TABLE public.page_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.article_view_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies for page_views
-- Anyone can insert page views (for anonymous tracking)
CREATE POLICY "Anyone can insert page views"
ON public.page_views
FOR INSERT
WITH CHECK (true);

-- Only admins can view page views
CREATE POLICY "Admins can view page views"
ON public.page_views
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Only admins can delete page views
CREATE POLICY "Admins can delete page views"
ON public.page_views
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for article_view_history
-- Anyone can insert article views
CREATE POLICY "Anyone can insert article views"
ON public.article_view_history
FOR INSERT
WITH CHECK (true);

-- Only admins can view article view history
CREATE POLICY "Admins can view article view history"
ON public.article_view_history
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Only admins can delete article view history
CREATE POLICY "Admins can delete article view history"
ON public.article_view_history
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));