-- Create kits table for managing jersey collections
CREATE TABLE public.kits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  type TEXT NOT NULL, -- 'domicile', 'exterieur', 'third', 'fourth'
  season TEXT NOT NULL DEFAULT '2024/25',
  image_url TEXT,
  description TEXT,
  price DECIMAL(8,2),
  is_featured BOOLEAN DEFAULT false,
  is_published BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.kits ENABLE ROW LEVEL SECURITY;

-- Create policies for kits
CREATE POLICY "Anyone can view published kits" 
ON public.kits 
FOR SELECT 
USING (is_published = true);

CREATE POLICY "Authenticated users can manage kits" 
ON public.kits 
FOR ALL 
USING (auth.uid() IS NOT NULL);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_kits_updated_at
BEFORE UPDATE ON public.kits
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default kits data
INSERT INTO public.kits (title, type, season, image_url, is_featured, display_order) VALUES
('Domicile 25/26', 'domicile', '2025/26', 'https://images.footballfanatics.com/real-madrid/real-madrid-home-shirt-2023-24_ss4_p-13369593+u-qwaj5h4fejb6c10qmv0g+v-a2ffe158eaf84f48b03382217c591319.jpg?_hv=2&w=900', true, 1),
('Tenue extérieur 25/26', 'exterieur', '2025/26', 'https://images.footballfanatics.com/real-madrid/real-madrid-away-shirt-2023-24_ss4_p-13369599+u-9wlae8hv115ibm12y76w+v-3e891a40dc0f4d079a5c5cb41d35cf2a.jpg?_hv=2&w=900', true, 2),
('Troisième kit 25/26', 'third', '2025/26', 'https://shop.adidas.jp/contents/product/GY8597/main/adidas_GY8597_standard-F3F4F6-standard-F3F4F6-standard-E2E2E2-standard-E2E2E2-standard-F3F4F6-standard-F3F4F6.jpg', true, 3),
('Quatrième kit 25/26', 'fourth', '2025/26', null, true, 4);