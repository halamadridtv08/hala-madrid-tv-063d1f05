
export interface Article {
  id: string;
  title: string;
  description: string;
  content: string;
  image_url?: string;
  video_url?: string;
  category: string;
  is_published: boolean;
  featured: boolean;
  published_at: string;
  updated_at: string;
  author_id: string;
  read_time?: string;
}

export interface ArticleImage {
  id: string;
  article_id: string;
  image_url: string;
  display_order: number;
  created_at: string;
  updated_at: string;
}
