import { useState, useEffect, useMemo } from "react";
import { useSearchParams, Navigate } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ShopHero } from "@/components/shop/ShopHero";
import { ShopAdvancedFilters, type ShopFilterState } from "@/components/shop/ShopAdvancedFilters";
import { ShopSearchBar } from "@/components/shop/ShopSearchBar";
import { ShopGrid } from "@/components/shop/ShopGrid";
import { ShopQuickView } from "@/components/shop/ShopQuickView";
import { ShopSizeGuide } from "@/components/shop/ShopSizeGuide";
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
import type { ShopProduct } from "@/types/Shop";

const Shop = () => {
  const { isVisible, loading: visibilityLoading } = useSiteVisibility();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCategory = searchParams.get("category") || "all";
  const paymentStatus = searchParams.get("payment");
  const orderId = searchParams.get("order");

  const [searchQuery, setSearchQuery] = useState("");
  const [quickViewProduct, setQuickViewProduct] = useState<ShopProduct | null>(null);
  const [quickViewOpen, setQuickViewOpen] = useState(false);
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);
  const { user } = useAuth();

  const [filters, setFilters] = useState<ShopFilterState>({
    category: initialCategory,
    priceRange: [0, 500],
    sizes: [],
    colors: [],
    sortBy: "newest",
    inStockOnly: false,
  });

  // Handle payment success
  useEffect(() => {
    if (paymentStatus === "success" && orderId) {
      toast.success("Paiement réussi ! Votre commande a été confirmée. 🎉", { duration: 6000 });
      setSearchParams({});
    }
  }, [paymentStatus, orderId, setSearchParams]);

  // Sync category to URL
  useEffect(() => {
    if (filters.category !== "all") {
      setSearchParams({ category: filters.category });
    } else {
      setSearchParams({});
    }
  }, [filters.category, setSearchParams]);

  const { data: products = [], isLoading } = useShopProducts(
    filters.category === "all" ? undefined : filters.category,
    searchQuery || undefined
  );

  // Client-side filtering for advanced filters
  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Price range
    result = result.filter((p) => p.price >= filters.priceRange[0] && p.price <= filters.priceRange[1]);

    // In stock only
    if (filters.inStockOnly) {
      result = result.filter((p) => p.stock > 0);
    }

    // Size filter
    if (filters.sizes.length > 0) {
      result = result.filter((p) =>
        p.variants.some(
          (v) => v.type === "size" && v.options.some((opt) => filters.sizes.includes(opt))
        )
      );
    }

    // Color filter
    if (filters.colors.length > 0) {
      result = result.filter((p) =>
        p.variants.some(
          (v) => v.type === "color" && v.options.some((opt) => filters.colors.includes(opt))
        )
      );
    }

    // Sort
    switch (filters.sortBy) {
      case "price-asc":
        result.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        result.sort((a, b) => b.price - a.price);
        break;
      case "popular":
        result.sort((a, b) => (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0));
        break;
      default: // newest
        break;
    }

    return result;
  }, [products, filters]);

  const { addToCart, cartCount } = useShopCart();
  const { toggleWishlist, isInWishlist, wishlistIds } = useShopWishlist();

  const handleAddToCart = (productId: string, variant?: Record<string, string>, quantity?: number) => {
    addToCart.mutate({ productId, variant, quantity: quantity || 1 });
  };

  const handleQuickView = (product: ShopProduct) => {
    setQuickViewProduct(product);
    setQuickViewOpen(true);
  };

  // Redirect if shop is hidden from public (after all hooks)
  if (!visibilityLoading && !isVisible('shop')) {
    return <Navigate to="/" replace />;
  }

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
            <Button size="lg" className="rounded-full shadow-lg gap-2 h-14 w-14 p-0 relative">
              <ShoppingCart className="h-5 w-5" />
              <Badge className="absolute -top-1 -right-1 rounded-full px-1.5 py-0.5 text-[10px] bg-destructive text-destructive-foreground">
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
              <Button variant="outline" size="sm" className="gap-1.5 text-xs rounded-none">
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
              <Button variant="outline" size="sm" className="gap-1.5 text-xs rounded-none">
                <Package className="h-3.5 w-3.5" /> Mes commandes
              </Button>
            </Link>
          </div>
        )}

        <section id="shop-products" className="container mx-auto px-4 py-10 space-y-6">
          {/* Search bar */}
          <ShopSearchBar value={searchQuery} onChange={setSearchQuery} />

          {/* Advanced filters */}
          <ShopAdvancedFilters
            filters={filters}
            onFiltersChange={setFilters}
            totalResults={filteredProducts.length}
          />

          {/* Product grid */}
          <ShopGrid
            products={filteredProducts}
            isLoading={isLoading}
            onAddToCart={(id) => handleAddToCart(id)}
            isInWishlist={isInWishlist}
            onToggleWishlist={(id) => toggleWishlist.mutate(id)}
            onQuickView={handleQuickView}
          />
        </section>

        <Footer />
      </div>

      {/* Quick View Modal */}
      <ShopQuickView
        product={quickViewProduct}
        open={quickViewOpen}
        onOpenChange={setQuickViewOpen}
        onAddToCart={handleAddToCart}
        isWishlisted={quickViewProduct ? isInWishlist(quickViewProduct.id) : false}
        onToggleWishlist={(id) => toggleWishlist.mutate(id)}
        onOpenSizeGuide={() => setSizeGuideOpen(true)}
      />

      {/* Size Guide Modal */}
      <ShopSizeGuide open={sizeGuideOpen} onOpenChange={setSizeGuideOpen} />
    </>
  );
};

export default Shop;
