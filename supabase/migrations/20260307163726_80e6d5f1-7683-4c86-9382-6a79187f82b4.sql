
-- Shop Products
CREATE TABLE public.shop_products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  price NUMERIC(10,2) NOT NULL DEFAULT 0,
  compare_price NUMERIC(10,2),
  category TEXT NOT NULL DEFAULT 'accessories',
  images JSONB DEFAULT '[]'::jsonb,
  variants JSONB DEFAULT '[]'::jsonb,
  stock INTEGER NOT NULL DEFAULT 0,
  supplier TEXT,
  is_published BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Shop Orders
CREATE TABLE public.shop_orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  total_price NUMERIC(10,2) NOT NULL DEFAULT 0,
  payment_status TEXT NOT NULL DEFAULT 'unpaid',
  payment_intent_id TEXT,
  shipping_address JSONB,
  tracking_number TEXT,
  discount_code TEXT,
  discount_amount NUMERIC(10,2) DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Shop Order Items
CREATE TABLE public.shop_order_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES public.shop_orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.shop_products(id) ON DELETE CASCADE,
  variant JSONB,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price NUMERIC(10,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Shop Reviews
CREATE TABLE public.shop_reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES public.shop_products(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  is_approved BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Shop Cart Items
CREATE TABLE public.shop_cart_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.shop_products(id) ON DELETE CASCADE,
  variant JSONB,
  quantity INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Shop Wishlists
CREATE TABLE public.shop_wishlists (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.shop_products(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, product_id)
);

-- Shop Discount Codes
CREATE TABLE public.shop_discount_codes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  type TEXT NOT NULL DEFAULT 'percentage',
  value NUMERIC(10,2) NOT NULL DEFAULT 0,
  min_order NUMERIC(10,2) DEFAULT 0,
  max_uses INTEGER,
  current_uses INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.shop_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shop_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shop_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shop_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shop_cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shop_wishlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shop_discount_codes ENABLE ROW LEVEL SECURITY;

-- RLS: shop_products - public read for published, admin write
CREATE POLICY "Anyone can view published products" ON public.shop_products
  FOR SELECT USING (is_published = true);

CREATE POLICY "Admins can manage products" ON public.shop_products
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- RLS: shop_orders - users see own orders, admin sees all
CREATE POLICY "Users can view own orders" ON public.shop_orders
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can create orders" ON public.shop_orders
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can manage all orders" ON public.shop_orders
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- RLS: shop_order_items - through order access
CREATE POLICY "Users can view own order items" ON public.shop_order_items
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.shop_orders WHERE id = order_id AND user_id = auth.uid()));

CREATE POLICY "Users can create order items" ON public.shop_order_items
  FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.shop_orders WHERE id = order_id AND user_id = auth.uid()));

CREATE POLICY "Admins can manage order items" ON public.shop_order_items
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- RLS: shop_reviews - public read for approved, users manage own
CREATE POLICY "Anyone can view approved reviews" ON public.shop_reviews
  FOR SELECT USING (is_approved = true);

CREATE POLICY "Users can create reviews" ON public.shop_reviews
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can manage reviews" ON public.shop_reviews
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- RLS: shop_cart_items - user-scoped
CREATE POLICY "Users manage own cart" ON public.shop_cart_items
  FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- RLS: shop_wishlists - user-scoped
CREATE POLICY "Users manage own wishlist" ON public.shop_wishlists
  FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- RLS: shop_discount_codes - public read for active, admin write
CREATE POLICY "Anyone can view active discount codes" ON public.shop_discount_codes
  FOR SELECT USING (is_active = true AND (expires_at IS NULL OR expires_at > now()));

CREATE POLICY "Admins can manage discount codes" ON public.shop_discount_codes
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Updated_at triggers
CREATE TRIGGER update_shop_products_updated_at BEFORE UPDATE ON public.shop_products
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_shop_orders_updated_at BEFORE UPDATE ON public.shop_orders
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_shop_cart_items_updated_at BEFORE UPDATE ON public.shop_cart_items
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_shop_discount_codes_updated_at BEFORE UPDATE ON public.shop_discount_codes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
