import { ShopProductCard } from "./ShopProductCard";
import { PackageOpen } from "lucide-react";
import { motion } from "framer-motion";
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
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-8">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="aspect-[3/4] bg-muted" />
            <div className="pt-4 space-y-2">
              <div className="h-3 bg-muted rounded w-1/3" />
              <div className="h-4 bg-muted rounded w-3/4" />
              <div className="h-4 bg-muted rounded w-1/4" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center py-24 space-y-6"
      >
        <PackageOpen className="h-20 w-20 mx-auto text-muted-foreground/30" />
        <div>
          <h3 className="font-montserrat font-bold text-xl text-foreground">
            Aucun produit trouvé
          </h3>
          <p className="text-muted-foreground text-sm mt-2">
            Revenez bientôt pour découvrir nos nouvelles collections
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <div>
      {/* Results count */}
      <p className="text-xs text-muted-foreground uppercase tracking-wider mb-6 font-medium">
        {products.length} produit{products.length > 1 ? "s" : ""}
      </p>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-10">
        {products.map((product, index) => (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05, duration: 0.4 }}
          >
            <ShopProductCard
              product={product}
              onAddToCart={onAddToCart}
              isWishlisted={isInWishlist?.(product.id)}
              onToggleWishlist={onToggleWishlist}
            />
          </motion.div>
        ))}
      </div>
    </div>
  );
};
