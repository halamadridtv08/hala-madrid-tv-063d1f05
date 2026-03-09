import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { useShopWishlist } from "@/hooks/useShopWishlist";
import { useShopCart } from "@/hooks/useShopCart";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { ShopProductCard } from "@/components/shop/ShopProductCard";
import { ArrowLeft, Heart } from "lucide-react";
import type { ShopProduct } from "@/types/Shop";

const ShopWishlist = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { wishlistIds, isInWishlist, toggleWishlist } = useShopWishlist();
  const { addToCart } = useShopCart();

  useEffect(() => {
    if (!user) navigate("/shop");
  }, [user, navigate]);

  const { data: products = [], isLoading } = useQuery({
    queryKey: ["shop-wishlist-products", wishlistIds],
    queryFn: async (): Promise<ShopProduct[]> => {
      if (wishlistIds.length === 0) return [];
      const { data, error } = await supabase
        .from("shop_products")
        .select("*")
        .in("id", wishlistIds)
        .eq("is_published", true);
      if (error) throw error;
      return (data || []).map((p: any) => ({
        ...p,
        images: Array.isArray(p.images) ? (p.images as unknown as string[]) : [],
        variants: Array.isArray(p.variants) ? p.variants : [],
      })) as ShopProduct[];
    },
    enabled: wishlistIds.length > 0,
  });

  return (
    <>
      <Helmet><title>Mes Favoris - HALA MADRID TV Shop</title></Helmet>
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-10">
          <Link to="/shop" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary mb-6">
            <ArrowLeft className="h-4 w-4" /> Retour à la boutique
          </Link>

          <h1 className="font-montserrat font-extrabold text-2xl text-foreground mb-8 flex items-center gap-2">
            <Heart className="h-6 w-6 text-destructive fill-destructive" />
            Mes Favoris ({wishlistIds.length})
          </h1>

          {isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="rounded-xl bg-card border border-border animate-pulse">
                  <div className="aspect-square bg-muted rounded-t-xl" />
                  <div className="p-4 space-y-2">
                    <div className="h-4 bg-muted rounded w-3/4" />
                    <div className="h-5 bg-muted rounded w-1/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-20 space-y-4">
              <Heart className="h-16 w-16 mx-auto text-muted-foreground/30" />
              <h2 className="font-montserrat font-semibold text-lg text-foreground">
                Aucun favori
              </h2>
              <p className="text-muted-foreground text-sm">
                Ajoutez des produits à vos favoris en cliquant sur le ❤️
              </p>
              <Link to="/shop"><Button className="mt-2">Explorer la boutique</Button></Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {products.map((product) => (
                <ShopProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={(id) => addToCart.mutate({ productId: id })}
                  isWishlisted={isInWishlist(product.id)}
                  onToggleWishlist={(id) => toggleWishlist.mutate(id)}
                />
              ))}
            </div>
          )}
        </div>
        <Footer />
      </div>
    </>
  );
};

export default ShopWishlist;
