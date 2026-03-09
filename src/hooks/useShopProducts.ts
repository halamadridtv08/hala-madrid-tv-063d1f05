import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { ShopProduct, ShopFeature } from "@/types/Shop";

const mapProduct = (p: any): ShopProduct => ({
  ...p,
  images: Array.isArray(p.images) ? p.images as unknown as string[] : [],
  variants: Array.isArray(p.variants) ? p.variants as unknown as ShopProduct['variants'] : [],
  features: Array.isArray(p.features) ? p.features as unknown as ShopFeature[] : [],
});

export const useShopProducts = (category?: string, search?: string) => {
  return useQuery({
    queryKey: ["shop-products", category, search],
    queryFn: async (): Promise<ShopProduct[]> => {
      let query = supabase
        .from("shop_products")
        .select("*")
        .eq("is_published", true)
        .order("created_at", { ascending: false });

      if (category && category !== "all") {
        query = query.eq("category", category);
      }

      if (search) {
        query = query.ilike("name", `%${search}%`);
      }

      const { data, error } = await query;
      if (error) throw error;

      return (data || []).map(mapProduct);
    },
  });
};

export const useShopProduct = (slug: string) => {
  return useQuery({
    queryKey: ["shop-product", slug],
    queryFn: async (): Promise<ShopProduct | null> => {
      const { data, error } = await supabase
        .from("shop_products")
        .select("*")
        .eq("slug", slug)
        .eq("is_published", true)
        .maybeSingle();

      if (error) throw error;
      if (!data) return null;

      return mapProduct(data);
    },
    enabled: !!slug,
  });
};

export const useFeaturedProducts = () => {
  return useQuery({
    queryKey: ["shop-featured-products"],
    queryFn: async (): Promise<ShopProduct[]> => {
      const { data, error } = await supabase
        .from("shop_products")
        .select("*")
        .eq("is_published", true)
        .eq("is_featured", true)
        .order("created_at", { ascending: false })
        .limit(8);

      if (error) throw error;

      return (data || []).map(mapProduct);
    },
  });
};
