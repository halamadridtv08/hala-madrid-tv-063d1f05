-- Create flash_news table for managing flash news/info updates
CREATE TABLE IF NOT EXISTS public.flash_news (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author TEXT NOT NULL,
  author_handle TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('transfer', 'injury', 'match', 'general')),
  verified BOOLEAN DEFAULT true,
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.flash_news ENABLE ROW LEVEL SECURITY;

-- Allow public to view published flash news
CREATE POLICY "Anyone can view published flash news"
  ON public.flash_news
  FOR SELECT
  USING (is_published = true);

-- Allow admins to manage flash news
CREATE POLICY "Admins can manage flash news"
  ON public.flash_news
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger to update updated_at timestamp
CREATE TRIGGER update_flash_news_updated_at
  BEFORE UPDATE ON public.flash_news
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for better performance
CREATE INDEX idx_flash_news_category ON public.flash_news(category);
CREATE INDEX idx_flash_news_published ON public.flash_news(is_published);
CREATE INDEX idx_flash_news_created_at ON public.flash_news(created_at DESC);