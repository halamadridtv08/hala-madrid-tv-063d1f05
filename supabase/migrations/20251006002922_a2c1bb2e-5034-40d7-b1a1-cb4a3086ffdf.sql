-- Add video_url column to articles table if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'articles' 
    AND column_name = 'video_url'
  ) THEN
    ALTER TABLE public.articles ADD COLUMN video_url TEXT;
  END IF;
END $$;

-- Ensure article_images table exists with correct structure
CREATE TABLE IF NOT EXISTS public.article_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id UUID NOT NULL REFERENCES public.articles(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on article_images
ALTER TABLE public.article_images ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Public can view article images" ON public.article_images;
DROP POLICY IF EXISTS "Admins can manage article images" ON public.article_images;

-- Create RLS policies for article_images
CREATE POLICY "Public can view article images"
ON public.article_images
FOR SELECT
USING (true);

CREATE POLICY "Admins can manage article images"
ON public.article_images
FOR ALL
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Add trigger for updated_at on article_images
DROP TRIGGER IF EXISTS update_article_images_updated_at ON public.article_images;
CREATE TRIGGER update_article_images_updated_at
  BEFORE UPDATE ON public.article_images
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();