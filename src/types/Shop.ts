export interface ShopProduct {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  compare_price: number | null;
  category: string;
  images: string[];
  variants: ShopVariant[];
  stock: number;
  supplier: string | null;
  is_published: boolean;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
}

export interface ShopVariant {
  id: string;
  name: string;
  type: 'size' | 'color' | 'style';
  options: string[];
}

export interface ShopCartItem {
  id: string;
  user_id: string;
  product_id: string;
  variant: Record<string, string> | null;
  quantity: number;
  created_at: string;
  updated_at: string;
  product?: ShopProduct;
}

export interface ShopOrder {
  id: string;
  user_id: string | null;
  status: string;
  total_price: number;
  payment_status: string;
  payment_intent_id: string | null;
  shipping_address: ShippingAddress | null;
  tracking_number: string | null;
  discount_code: string | null;
  discount_amount: number;
  created_at: string;
  updated_at: string;
  items?: ShopOrderItem[];
}

export interface ShopOrderItem {
  id: string;
  order_id: string;
  product_id: string;
  variant: Record<string, string> | null;
  quantity: number;
  unit_price: number;
  product?: ShopProduct;
}

export interface ShippingAddress {
  name: string;
  line1: string;
  line2?: string;
  city: string;
  state?: string;
  postal_code: string;
  country: string;
}

export interface ShopReview {
  id: string;
  product_id: string;
  user_id: string | null;
  rating: number;
  comment: string | null;
  is_approved: boolean;
  created_at: string;
}

export interface ShopDiscountCode {
  id: string;
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  min_order: number;
  max_uses: number | null;
  current_uses: number;
  is_active: boolean;
  expires_at: string | null;
}

export type ShopCategory = 'jerseys' | 'accessories' | 'home-decor' | 'gaming' | 'posters' | 'special';

export const SHOP_CATEGORIES: { value: ShopCategory; label: string; icon: string }[] = [
  { value: 'jerseys', label: 'Maillots', icon: '👕' },
  { value: 'accessories', label: 'Accessoires', icon: '⌚' },
  { value: 'home-decor', label: 'Maison & Déco', icon: '🏠' },
  { value: 'gaming', label: 'Gaming', icon: '🎮' },
  { value: 'posters', label: 'Posters', icon: '🖼️' },
  { value: 'special', label: 'Collection Spéciale', icon: '⭐' },
];
