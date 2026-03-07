import { ShopProductCard } from "./ShopProductCard";
import { PackageOpen } from "lucide-react";
import type { ShopProduct } from "@/types/Shop";

interface ShopGridProps {
  products: ShopProduct[];
  isLoading: boolean;
  onAddToCart?: (productId: string) => void;
  isInWishlist?: (productId: string) => boolean;
  onToggleWishlist?: (productId: string) => void;
}

export const ShopGrid = ({ products, isLoading, onAddToCart, isInWishlist, onToggleWishlist }: ShopGridProps) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="rounded-xl bg-card border border-border animate-pulse">
            <div className="aspect-square bg-muted rounded-t-xl" />
            <div className="p-4 space-y-2">
              <div className="h-4 bg-muted rounded w-3/4" />
              <div className="h-3 bg-muted rounded w-1/2" />
              <div className="h-5 bg-muted rounded w-1/3" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-16 space-y-4">
        <PackageOpen className="h-16 w-16 mx-auto text-muted-foreground/50" />
        <h3 className="font-montserrat font-semibold text-lg text-foreground">
          Aucun produit trouvé
        </h3>
        <p className="text-muted-foreground text-sm">
          La boutique sera bientôt disponible avec des produits exclusifs !
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
      {products.map((product) => (
        <ShopProductCard
          key={product.id}
          product={product}
          onAddToCart={onAddToCart}
          isWishlisted={isInWishlist?.(product.id)}
          onToggleWishlist={onToggleWishlist}
        />
      ))}
    </div>
  );
};
