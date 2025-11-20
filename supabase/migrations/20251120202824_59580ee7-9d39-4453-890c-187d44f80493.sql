-- Create flash_news_categories table for custom categories
CREATE TABLE public.flash_news_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  color TEXT NOT NULL DEFAULT '#3b82f6',
  icon TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.flash_news_categories ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Anyone can view active categories"
ON public.flash_news_categories
FOR SELECT
USING (is_active = true);

CREATE POLICY "Admins can manage categories"
ON public.flash_news_categories
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Insert default categories
INSERT INTO public.flash_news_categories (name, slug, color, icon, display_order) VALUES
  ('Transfert', 'transfer', '#10b981', '🔄', 1),
  ('Blessure', 'injury', '#ef4444', '🏥', 2),
  ('Match', 'match', '#3b82f6', '⚽', 3),
  ('Général', 'general', '#6b7280', '📰', 4);

-- Create flash_news_versions table for collaborative drafts history
CREATE TABLE public.flash_news_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  flash_news_id UUID NOT NULL REFERENCES public.flash_news(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  author TEXT NOT NULL,
  author_handle TEXT NOT NULL,
  category TEXT NOT NULL,
  verified BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'draft',
  scheduled_at TIMESTAMP WITH TIME ZONE,
  modified_by UUID REFERENCES auth.users(id),
  modified_by_email TEXT,
  change_description TEXT,
  version_number INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.flash_news_versions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for versions
CREATE POLICY "Moderators and admins can view all versions"
ON public.flash_news_versions
FOR SELECT
USING (
  has_role(auth.uid(), 'moderator'::app_role) OR 
  has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Moderators and admins can create versions"
ON public.flash_news_versions
FOR INSERT
WITH CHECK (
  has_role(auth.uid(), 'moderator'::app_role) OR 
  has_role(auth.uid(), 'admin'::app_role)
);

-- Create index for faster queries
CREATE INDEX idx_flash_news_versions_flash_news_id ON public.flash_news_versions(flash_news_id);
CREATE INDEX idx_flash_news_versions_created_at ON public.flash_news_versions(created_at DESC);

-- Trigger to update flash_news_categories updated_at
CREATE TRIGGER update_flash_news_categories_updated_at
  BEFORE UPDATE ON public.flash_news_categories
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();