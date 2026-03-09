import { motion } from "framer-motion";
import { Heart, ShoppingCart, Eye } from "lucide-react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { ShopProduct } from "@/types/Shop";

interface ShopProductCardProps {
  product: ShopProduct;
  onAddToCart?: (productId: string) => void;
  isWishlisted?: boolean;
  onToggleWishlist?: (productId: string) => void;
}

export const ShopProductCard = ({ product, onAddToCart, isWishlisted, onToggleWishlist }: ShopProductCardProps) => {
  const discount = product.compare_price
    ? Math.round(((product.compare_price - product.price) / product.compare_price) * 100)
    : 0;

  const mainImage = product.images?.[0] || "/placeholder.svg";
  const hoverImage = product.images?.[1] || mainImage;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="group relative flex flex-col"
    >
      {/* Image container */}
      <Link to={`/shop/${product.slug}`} className="block relative aspect-[3/4] overflow-hidden bg-muted/30">
        {/* Main image */}
        <img
          src={mainImage}
          alt={product.name}
          className="absolute inset-0 w-full h-full object-cover transition-opacity duration-500 group-hover:opacity-0"
          loading="lazy"
        />
        {/* Hover image */}
        <img
          src={hoverImage}
          alt={product.name}
          className="absolute inset-0 w-full h-full object-cover transition-opacity duration-500 opacity-0 group-hover:opacity-100"
          loading="lazy"
        />

        {/* Overlay on hover */}
        <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/5 transition-colors duration-300" />

        {/* Top-left badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
          {product.is_featured && (
            <Badge className="bg-foreground text-background text-[9px] font-black uppercase tracking-widest rounded-none px-2.5 py-1">
              Best Seller
            </Badge>
          )}
          {discount > 0 && (
            <Badge className="bg-destructive text-destructive-foreground text-[9px] font-black uppercase tracking-widest rounded-none px-2.5 py-1">
              -{discount}%
            </Badge>
          )}
          {product.stock === 0 && (
            <Badge className="bg-muted text-muted-foreground text-[9px] font-black uppercase tracking-widest rounded-none px-2.5 py-1">
              Épuisé
            </Badge>
          )}
        </div>

        {/* Wishlist */}
        <motion.button
          whileTap={{ scale: 0.85 }}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onToggleWishlist?.(product.id);
          }}
          className={`absolute top-3 right-3 z-10 p-2.5 rounded-full transition-all duration-300 ${
            isWishlisted
              ? "bg-destructive text-destructive-foreground scale-100"
              : "bg-background/80 backdrop-blur-sm text-foreground opacity-0 group-hover:opacity-100 hover:bg-background"
          }`}
        >
          <Heart className={`h-4 w-4 ${isWishlisted ? "fill-current" : ""}`} />
        </motion.button>

        {/* Bottom action bar — slides up on hover */}
        <div className="absolute bottom-0 left-0 right-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out z-10">
          <div className="flex gap-px">
            <Button
              className="flex-1 rounded-none h-11 gap-2 text-xs font-bold uppercase tracking-wider"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onAddToCart?.(product.id);
              }}
              disabled={product.stock <= 0}
            >
              <ShoppingCart className="h-3.5 w-3.5" />
              Ajouter
            </Button>
            <Button
              variant="secondary"
              className="rounded-none h-11 w-11 p-0"
              asChild
            >
              <Link to={`/shop/${product.slug}`} onClick={(e) => e.stopPropagation()}>
                <Eye className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </Link>

      {/* Product info — clean, minimal */}
      <div className="pt-4 pb-2 space-y-1.5">
        <Link to={`/shop/${product.slug}`}>
          <p className="text-[11px] text-muted-foreground uppercase tracking-wider font-medium">
            {product.category}
          </p>
          <h3 className="font-montserrat font-semibold text-sm text-foreground line-clamp-1 mt-0.5 group-hover:text-primary transition-colors">
            {product.name}
          </h3>
        </Link>

        <div className="flex items-baseline gap-2 pt-0.5">
          <span className="font-montserrat font-bold text-base text-foreground">
            {product.price.toFixed(2)} €
          </span>
          {product.compare_price && (
            <span className="text-xs text-muted-foreground line-through">
              {product.compare_price.toFixed(2)} €
            </span>
          )}
        </div>

        {/* Color swatches preview */}
        {product.variants?.some(v => v.type === 'color') && (
          <div className="flex gap-1.5 pt-1">
            {product.variants
              .filter(v => v.type === 'color')
              .flatMap(v => v.options)
              .slice(0, 4)
              .map((color) => (
                <span
                  key={color}
                  className="w-3.5 h-3.5 rounded-full border border-border"
                  style={{ backgroundColor: color.toLowerCase() }}
                  title={color}
                />
              ))}
          </div>
        )}

        {product.stock > 0 && product.stock <= 5 && (
          <p className="text-[10px] text-destructive font-semibold uppercase tracking-wider">
            Plus que {product.stock} en stock
          </p>
        )}
      </div>
    </motion.div>
  );
};
