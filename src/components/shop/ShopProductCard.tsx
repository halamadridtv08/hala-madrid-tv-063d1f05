import { motion } from "framer-motion";
import { Heart, ShoppingCart, Star } from "lucide-react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { ShopProduct } from "@/types/Shop";

interface ShopProductCardProps {
  product: ShopProduct;
  onAddToCart?: (productId: string) => void;
}

export const ShopProductCard = ({ product, onAddToCart }: ShopProductCardProps) => {
  const discount = product.compare_price
    ? Math.round(((product.compare_price - product.price) / product.compare_price) * 100)
    : 0;

  const mainImage = product.images?.[0] || "/placeholder.svg";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3 }}
      className="group relative rounded-xl overflow-hidden bg-card border border-border hover:border-primary/40 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5"
    >
      {/* Image */}
      <Link to={`/shop/${product.slug}`} className="block relative aspect-square overflow-hidden">
        <img
          src={mainImage}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          loading="lazy"
        />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {product.is_featured && (
            <Badge className="bg-secondary text-secondary-foreground text-[10px] font-bold uppercase tracking-wider">
              ⭐ Best Seller
            </Badge>
          )}
          {discount > 0 && (
            <Badge variant="destructive" className="text-[10px] font-bold">
              -{discount}%
            </Badge>
          )}
          {product.stock <= 5 && product.stock > 0 && (
            <Badge variant="outline" className="bg-background/80 backdrop-blur text-[10px]">
              Plus que {product.stock} !
            </Badge>
          )}
        </div>

        {/* Wishlist button */}
        <button className="absolute top-3 right-3 p-2 rounded-full bg-background/60 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-background/80">
          <Heart className="h-4 w-4 text-foreground" />
        </button>
      </Link>

      {/* Info */}
      <div className="p-4 space-y-2">
        <Link to={`/shop/${product.slug}`}>
          <h3 className="font-montserrat font-semibold text-sm text-foreground line-clamp-2 group-hover:text-primary transition-colors">
            {product.name}
          </h3>
        </Link>

        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star key={star} className="h-3 w-3 fill-secondary text-secondary" />
          ))}
          <span className="text-[10px] text-muted-foreground ml-1">(0)</span>
        </div>

        <div className="flex items-center justify-between pt-1">
          <div className="flex items-baseline gap-2">
            <span className="font-montserrat font-bold text-lg text-foreground">
              {product.price.toFixed(2)}€
            </span>
            {product.compare_price && (
              <span className="text-xs text-muted-foreground line-through">
                {product.compare_price.toFixed(2)}€
              </span>
            )}
          </div>

          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8 rounded-full hover:bg-primary hover:text-primary-foreground transition-colors"
            onClick={(e) => {
              e.preventDefault();
              onAddToCart?.(product.id);
            }}
          >
            <ShoppingCart className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
};
