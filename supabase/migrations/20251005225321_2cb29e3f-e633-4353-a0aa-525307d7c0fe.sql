-- Add video_url to articles table
ALTER TABLE public.articles 
ADD COLUMN video_url text;

-- Create article_images table for image galleries
CREATE TABLE public.article_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id uuid NOT NULL REFERENCES public.articles(id) ON DELETE CASCADE,
  image_url text NOT NULL,
  display_order integer DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on article_images
ALTER TABLE public.article_images ENABLE ROW LEVEL SECURITY;

-- RLS policies for article_images
CREATE POLICY "Public can view article images"
ON public.article_images
FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can manage article images"
ON public.article_images
FOR ALL
USING (auth.uid() IS NOT NULL);

-- Add trigger for updated_at
CREATE TRIGGER update_article_images_updated_at
BEFORE UPDATE ON public.article_images
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();