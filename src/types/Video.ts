
export interface VideoType {
  id: string;
  title: string;
  description?: string;
  video_url: string;
  thumbnail_url?: string;
  category?: string;
  duration?: number;
  is_published: boolean;
  published_at: string;
  created_at: string;
  updated_at: string;
}
