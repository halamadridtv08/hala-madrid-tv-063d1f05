import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export const useShopWishlist = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const wishlistQuery = useQuery({
    queryKey: ["shop-wishlist", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("shop_wishlists")
        .select("product_id")
        .eq("user_id", user.id);
      if (error) throw error;
      return (data || []).map((w) => w.product_id);
    },
    enabled: !!user,
  });

  const toggleWishlist = useMutation({
    mutationFn: async (productId: string) => {
      if (!user) throw new Error("Connexion requise");
      const isInWishlist = wishlistQuery.data?.includes(productId);
      if (isInWishlist) {
        const { error } = await supabase
          .from("shop_wishlists")
          .delete()
          .eq("user_id", user.id)
          .eq("product_id", productId);
        if (error) throw error;
        return { added: false };
      } else {
        const { error } = await supabase
          .from("shop_wishlists")
          .insert({ user_id: user.id, product_id: productId });
        if (error) throw error;
        return { added: true };
      }
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["shop-wishlist"] });
      toast.success(result.added ? "Ajouté aux favoris ❤️" : "Retiré des favoris");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const isInWishlist = (productId: string) =>
    wishlistQuery.data?.includes(productId) || false;

  return {
    wishlistIds: wishlistQuery.data || [],
    isLoading: wishlistQuery.isLoading,
    toggleWishlist,
    isInWishlist,
  };
};
