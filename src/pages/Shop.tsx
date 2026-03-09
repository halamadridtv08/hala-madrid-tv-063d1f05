import { useState, useEffect } from "react";
import { useSearchParams, Navigate } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ShopHero } from "@/components/shop/ShopHero";
import { ShopFilters } from "@/components/shop/ShopFilters";
import { ShopGrid } from "@/components/shop/ShopGrid";
import { useShopProducts } from "@/hooks/useShopProducts";
import { useShopCart } from "@/hooks/useShopCart";
import { useShopWishlist } from "@/hooks/useShopWishlist";
import { useSiteVisibility } from "@/hooks/useSiteVisibility";
import { Helmet } from "react-helmet-async";
import { ShoppingCart, Heart, Package, CheckCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const Shop = () => {
  const { isVisible, loading: visibilityLoading } = useSiteVisibility();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCategory = searchParams.get("category") || "all";
  const paymentStatus = searchParams.get("payment");
  const orderId = searchParams.get("order");

  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [searchQuery, setSearchQuery] = useState("");
  const { user } = useAuth();

  // Handle payment success
  useEffect(() => {
    if (paymentStatus === "success" && orderId) {
      toast.success("Paiement réussi ! Votre commande a été confirmée. 🎉", { duration: 6000 });
      setSearchParams({});
    }
  }, [paymentStatus, orderId, setSearchParams]);

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    if (category !== "all") {
      setSearchParams({ category });
    } else {
      setSearchParams({});
    }
  };

  const { data: products = [], isLoading } = useShopProducts(
    selectedCategory === "all" ? undefined : selectedCategory,
    searchQuery || undefined
  );

  const { addToCart, cartCount } = useShopCart();
  const { toggleWishlist, isInWishlist, wishlistIds } = useShopWishlist();

  const handleAddToCart = (productId: string) => {
    addToCart.mutate({ productId });
  };

  // Redirect if shop is hidden from public (after all hooks)
  if (!visibilityLoading && !isVisible('shop')) {
    return <Navigate to="/" replace />;
  }

  const handleToggleWishlist = (productId: string) => {
    toggleWishlist.mutate(productId);
  };

  return (
    <>
      <Helmet>
        <title>Shop - HALA MADRID TV | Boutique Fan Officielle</title>
        <meta
          name="description"
          content="Boutique officielle HALA MADRID TV. Maillots, accessoires, posters et articles gaming pour les fans du Real Madrid."
        />
      </Helmet>

      <div className="min-h-screen bg-background">
        <Navbar />

        {/* Payment success banner */}
        {paymentStatus === "success" && (
          <div className="bg-primary/10 border-b border-primary/20 px-4 py-3">
            <div className="container mx-auto flex items-center gap-3 justify-center">
              <CheckCircle className="h-5 w-5 text-primary" />
              <span className="text-sm font-semibold text-primary">
                Commande confirmée ! Vous recevrez un email de confirmation.
              </span>
              <Link to="/shop/orders">
                <Button variant="outline" size="sm" className="text-xs">
                  Voir mes commandes
                </Button>
              </Link>
            </div>
          </div>
        )}

        {/* Floating cart button */}
        {cartCount > 0 && (
          <Link to="/shop/cart" className="fixed bottom-6 right-6 z-50">
            <Button size="lg" className="rounded-full shadow-lg gap-2">
              <ShoppingCart className="h-5 w-5" />
              <Badge variant="secondary" className="rounded-full px-2 py-0.5 text-xs">
                {cartCount}
              </Badge>
            </Button>
          </Link>
        )}

        <ShopHero />

        {/* Quick links */}
        {user && (
          <div className="container mx-auto px-4 flex gap-3 justify-end -mt-4 mb-2">
            <Link to="/shop/wishlist">
              <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                <Heart className="h-3.5 w-3.5" />
                Favoris
                {wishlistIds.length > 0 && (
                  <Badge variant="secondary" className="rounded-full px-1.5 py-0 text-[10px] ml-0.5">
                    {wishlistIds.length}
                  </Badge>
                )}
              </Button>
            </Link>
            <Link to="/shop/orders">
              <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                <Package className="h-3.5 w-3.5" /> Mes commandes
              </Button>
            </Link>
          </div>
        )}

        <section id="shop-products" className="container mx-auto px-4 py-10 space-y-8">
          <ShopFilters
            selectedCategory={selectedCategory}
            onCategoryChange={handleCategoryChange}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
          />

          <ShopGrid
            products={products}
            isLoading={isLoading}
            onAddToCart={handleAddToCart}
            isInWishlist={isInWishlist}
            onToggleWishlist={handleToggleWishlist}
          />
        </section>

        <Footer />
      </div>
    </>
  );
};

export default Shop;
