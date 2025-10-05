-- Create youtube_videos table
CREATE TABLE public.youtube_videos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  thumbnail_url TEXT NOT NULL,
  youtube_url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_published BOOLEAN DEFAULT true
);

-- Enable Row Level Security
ALTER TABLE public.youtube_videos ENABLE ROW LEVEL SECURITY;

-- Create policies for public viewing
CREATE POLICY "Anyone can view published YouTube videos"
ON public.youtube_videos
FOR SELECT
USING (is_published = true);

-- Create policies for authenticated users (admin)
CREATE POLICY "Authenticated users can manage YouTube videos"
ON public.youtube_videos
FOR ALL
USING (auth.role() = 'authenticated');

-- Create trigger for updated_at
CREATE TRIGGER update_youtube_videos_updated_at
BEFORE UPDATE ON public.youtube_videos
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();