export interface Kit {
  id: string;
  title: string;
  type: 'domicile' | 'exterieur' | 'third' | 'fourth';
  season: string;
  image_url?: string;
  description?: string;
  price?: number;
  is_featured: boolean;
  is_published: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}