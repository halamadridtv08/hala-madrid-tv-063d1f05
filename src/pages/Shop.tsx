import { useState, useMemo } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ShopHero } from "@/components/shop/ShopHero";
import { ShopFilters } from "@/components/shop/ShopFilters";
import { ShopGrid } from "@/components/shop/ShopGrid";
import { useShopProducts } from "@/hooks/useShopProducts";
import { useShopCart } from "@/hooks/useShopCart";
import { Helmet } from "react-helmet-async";
import { ShoppingCart } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Shop = () => {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const { data: products = [], isLoading } = useShopProducts(
    selectedCategory === "all" ? undefined : selectedCategory,
    searchQuery || undefined
  );

  const { addToCart, cartCount } = useShopCart();

  const handleAddToCart = (productId: string) => {
    addToCart.mutate({ productId });
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

        <section className="container mx-auto px-4 py-10 space-y-8">
          <ShopFilters
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
          />

          <ShopGrid
            products={products}
            isLoading={isLoading}
            onAddToCart={handleAddToCart}
          />
        </section>

        <Footer />
      </div>
    </>
  );
};

export default Shop;
