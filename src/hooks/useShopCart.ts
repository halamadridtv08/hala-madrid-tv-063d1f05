import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import type { ShopCartItem } from "@/types/Shop";

export const useShopCart = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const cartQuery = useQuery({
    queryKey: ["shop-cart", user?.id],
    queryFn: async (): Promise<ShopCartItem[]> => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("shop_cart_items")
        .select("*")
        .eq("user_id", user.id);

      if (error) throw error;
      return (data || []) as ShopCartItem[];
    },
    enabled: !!user,
  });

  const addToCart = useMutation({
    mutationFn: async ({ productId, variant, quantity = 1 }: { productId: string; variant?: Record<string, string>; quantity?: number }) => {
      if (!user) throw new Error("Connexion requise");

      // Check if item already exists in cart
      const { data: existing } = await supabase
        .from("shop_cart_items")
        .select("id, quantity")
        .eq("user_id", user.id)
        .eq("product_id", productId)
        .maybeSingle();

      if (existing) {
        const { error } = await supabase
          .from("shop_cart_items")
          .update({ quantity: existing.quantity + quantity })
          .eq("id", existing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("shop_cart_items")
          .insert({ user_id: user.id, product_id: productId, variant, quantity });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shop-cart"] });
      toast.success("Ajouté au panier !");
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });

  const removeFromCart = useMutation({
    mutationFn: async (cartItemId: string) => {
      const { error } = await supabase
        .from("shop_cart_items")
        .delete()
        .eq("id", cartItemId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shop-cart"] });
    },
  });

  const updateQuantity = useMutation({
    mutationFn: async ({ cartItemId, quantity }: { cartItemId: string; quantity: number }) => {
      if (quantity <= 0) {
        const { error } = await supabase
          .from("shop_cart_items")
          .delete()
          .eq("id", cartItemId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("shop_cart_items")
          .update({ quantity })
          .eq("id", cartItemId);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shop-cart"] });
    },
  });

  const cartCount = cartQuery.data?.reduce((sum, item) => sum + item.quantity, 0) || 0;

  return {
    items: cartQuery.data || [],
    isLoading: cartQuery.isLoading,
    cartCount,
    addToCart,
    removeFromCart,
    updateQuantity,
  };
};
