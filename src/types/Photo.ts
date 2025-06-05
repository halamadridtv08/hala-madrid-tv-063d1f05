
export interface PhotoType {
  id: string;
  title: string;
  description?: string;
  image_url: string;
  category?: string;
  photographer?: string;
  is_published: boolean;
  published_at: string;
  created_at: string;
  updated_at: string;
}
