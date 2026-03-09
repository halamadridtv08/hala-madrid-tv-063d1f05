import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Heart, Minus, Plus, ChevronLeft, ChevronRight, Ruler } from "lucide-react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import type { ShopProduct } from "@/types/Shop";

interface ShopQuickViewProps {
  product: ShopProduct | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddToCart?: (productId: string, variant?: Record<string, string>, quantity?: number) => void;
  isWishlisted?: boolean;
  onToggleWishlist?: (productId: string) => void;
  onOpenSizeGuide?: () => void;
}

export const ShopQuickView = ({
  product,
  open,
  onOpenChange,
  onAddToCart,
  isWishlisted,
  onToggleWishlist,
  onOpenSizeGuide,
}: ShopQuickViewProps) => {
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});

  if (!product) return null;

  const images = product.images.length > 0 ? product.images : ["/placeholder.svg"];
  const discount = product.compare_price
    ? Math.round(((product.compare_price - product.price) / product.compare_price) * 100)
    : 0;

  const handleAddToCart = () => {
    onAddToCart?.(product.id, Object.keys(selectedVariants).length > 0 ? selectedVariants : undefined, quantity);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl p-0 gap-0 rounded-none border-border overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2 max-h-[85vh]">
          {/* Image gallery */}
          <div className="relative aspect-square md:aspect-auto bg-muted/20 overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.img
                key={selectedImage}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                src={images[selectedImage]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </AnimatePresence>

            {/* Badges */}
            <div className="absolute top-4 left-4 flex flex-col gap-1.5">
              {product.is_featured && (
                <Badge className="bg-foreground text-background text-[9px] font-black uppercase tracking-widest rounded-none px-2.5 py-1">
                  Best Seller
                </Badge>
              )}
              {discount > 0 && (
                <Badge className="bg-destructive text-destructive-foreground text-[9px] font-black uppercase rounded-none px-2.5 py-1">
                  -{discount}%
                </Badge>
              )}
            </div>

            {/* Nav arrows */}
            {images.length > 1 && (
              <>
                <button
                  onClick={() => setSelectedImage((p) => (p === 0 ? images.length - 1 : p - 1))}
                  className="absolute left-3 top-1/2 -translate-y-1/2 p-2 bg-background/80 backdrop-blur-sm hover:bg-background transition-colors"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setSelectedImage((p) => (p === images.length - 1 ? 0 : p + 1))}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-background/80 backdrop-blur-sm hover:bg-background transition-colors"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </>
            )}

            {/* Thumbnail dots */}
            {images.length > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                {images.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      i === selectedImage ? "bg-foreground w-6" : "bg-foreground/30"
                    }`}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Product info */}
          <div className="p-6 md:p-8 overflow-y-auto space-y-5">
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] font-medium mb-1">
                {product.category}
              </p>
              <h2 className="font-montserrat font-black text-xl md:text-2xl text-foreground leading-tight">
                {product.name}
              </h2>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3">
              <span className="font-montserrat font-black text-2xl text-foreground">
                {product.price.toFixed(2)} €
              </span>
              {product.compare_price && (
                <>
                  <span className="text-sm text-muted-foreground line-through">
                    {product.compare_price.toFixed(2)} €
                  </span>
                  <Badge variant="destructive" className="rounded-none text-[10px] font-black">
                    -{discount}%
                  </Badge>
                </>
              )}
            </div>

            {/* Stock */}
            {product.stock > 0 ? (
              <span className="flex items-center gap-1.5 text-xs font-semibold text-primary">
                <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                En stock
                {product.stock <= 5 && (
                  <span className="text-destructive ml-1">— Plus que {product.stock} !</span>
                )}
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-xs font-semibold text-destructive">
                <span className="w-2 h-2 bg-destructive rounded-full" />
                Rupture de stock
              </span>
            )}

            {/* Short description */}
            {product.description && (
              <p className="text-muted-foreground text-sm leading-relaxed line-clamp-3">
                {product.description}
              </p>
            )}

            {/* Variants */}
            {product.variants.map((variant) => (
              <div key={variant.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-foreground">
                    {variant.name}
                    {selectedVariants[variant.name] && (
                      <span className="font-normal text-muted-foreground normal-case tracking-normal ml-2">
                        — {selectedVariants[variant.name]}
                      </span>
                    )}
                  </label>
                  {variant.type === "size" && onOpenSizeGuide && (
                    <button
                      onClick={onOpenSizeGuide}
                      className="text-[10px] text-muted-foreground hover:text-foreground underline flex items-center gap-1 uppercase tracking-wider"
                    >
                      <Ruler className="h-3 w-3" />
                      Guide des tailles
                    </button>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {variant.type === "color"
                    ? variant.options.map((opt) => (
                        <button
                          key={opt}
                          onClick={() => setSelectedVariants((prev) => ({ ...prev, [variant.name]: opt }))}
                          className={`w-9 h-9 rounded-full border-2 transition-all ${
                            selectedVariants[variant.name] === opt
                              ? "border-foreground scale-110 ring-2 ring-foreground ring-offset-2 ring-offset-background"
                              : "border-border hover:border-foreground/50"
                          }`}
                          style={{ backgroundColor: opt.toLowerCase() }}
                          title={opt}
                        />
                      ))
                    : variant.options.map((opt) => (
                        <button
                          key={opt}
                          onClick={() => setSelectedVariants((prev) => ({ ...prev, [variant.name]: opt }))}
                          className={`min-w-[44px] px-3 py-2 text-xs font-bold uppercase tracking-wider transition-all border ${
                            selectedVariants[variant.name] === opt
                              ? "border-foreground bg-foreground text-background"
                              : "border-border text-foreground hover:border-foreground"
                          }`}
                        >
                          {opt}
                        </button>
                      ))}
                </div>
              </div>
            ))}

            {/* Quantity + Add to cart */}
            <div className="flex items-stretch gap-3 pt-2">
              <div className="flex items-center border border-border">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-2.5 hover:bg-muted transition-colors"
                >
                  <Minus className="h-3.5 w-3.5" />
                </button>
                <span className="px-4 font-montserrat font-bold text-sm text-foreground min-w-[40px] text-center">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  className="p-2.5 hover:bg-muted transition-colors"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>

              <Button
                className="flex-1 gap-2 font-montserrat font-bold text-xs uppercase tracking-wider rounded-none h-auto"
                onClick={handleAddToCart}
                disabled={product.stock <= 0}
              >
                <ShoppingCart className="h-4 w-4" />
                Ajouter au panier
              </Button>

              <Button
                size="icon"
                variant={isWishlisted ? "destructive" : "outline"}
                className="h-auto w-12 rounded-none"
                onClick={() => onToggleWishlist?.(product.id)}
              >
                <Heart className={`h-4 w-4 ${isWishlisted ? "fill-current" : ""}`} />
              </Button>
            </div>

            {/* View full details link */}
            <Link
              to={`/shop/${product.slug}`}
              onClick={() => onOpenChange(false)}
              className="block text-center text-xs font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors underline underline-offset-4 pt-2"
            >
              Voir tous les détails →
            </Link>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
