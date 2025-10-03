export interface KitImage {
  id: string;
  kit_id: string;
  image_url: string;
  display_order: number;
  is_primary: boolean;
  created_at: string;
  updated_at: string;
}

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
  kit_images?: KitImage[];
}