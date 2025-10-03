-- Create kit_images table for multiple images per kit
CREATE TABLE IF NOT EXISTS public.kit_images (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  kit_id UUID NOT NULL REFERENCES public.kits(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.kit_images ENABLE ROW LEVEL SECURITY;

-- Create policies for kit_images
CREATE POLICY "Anyone can view kit images"
  ON public.kit_images
  FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can manage kit images"
  ON public.kit_images
  FOR ALL
  USING (auth.uid() IS NOT NULL);

-- Create trigger for updated_at
CREATE TRIGGER update_kit_images_updated_at
  BEFORE UPDATE ON public.kit_images
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for faster queries
CREATE INDEX idx_kit_images_kit_id ON public.kit_images(kit_id);
CREATE INDEX idx_kit_images_display_order ON public.kit_images(display_order);