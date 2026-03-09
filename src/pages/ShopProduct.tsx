import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { useShopProduct, useShopProducts } from "@/hooks/useShopProducts";
import { useShopCart } from "@/hooks/useShopCart";
import { useShopWishlist } from "@/hooks/useShopWishlist";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { ShoppingCart, Heart, ChevronLeft, Minus, Plus, Truck, Shield, RotateCcw, Check, Info } from "lucide-react";
import { ShopProductCard } from "@/components/shop/ShopProductCard";
import { ShopReviews } from "@/components/shop/ShopReviews";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

const ShopProduct = () => {
  const { slug } = useParams<{ slug: string }>();
  const { data: product, isLoading } = useShopProduct(slug || "");
  const { data: relatedProducts = [] } = useShopProducts(product?.category);
  const { addToCart } = useShopCart();
  const { toggleWishlist, isInWishlist } = useShopWishlist();

  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            <div className="aspect-square bg-muted rounded-xl animate-pulse" />
            <div className="space-y-4">
              <div className="h-8 bg-muted rounded w-3/4" />
              <div className="h-6 bg-muted rounded w-1/4" />
              <div className="h-24 bg-muted rounded" />
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-2xl font-montserrat font-bold text-foreground">Produit non trouvé</h1>
          <Link to="/shop">
            <Button className="mt-4">Retour à la boutique</Button>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const discount = product.compare_price
    ? Math.round(((product.compare_price - product.price) / product.compare_price) * 100)
    : 0;

  const images = product.images.length > 0 ? product.images : ["/placeholder.svg"];
  const related = relatedProducts.filter((p) => p.id !== product.id).slice(0, 4);

  const handleAddToCart = () => {
    // Validate variants selection
    const requiredVariants = product.variants.filter((v) => v.options.length > 0);
    const missingVariants = requiredVariants.filter((v) => !selectedVariants[v.name]);
    if (missingVariants.length > 0) {
      toast.error(`Sélectionnez : ${missingVariants.map((v) => v.name).join(", ")}`);
      return;
    }

    addToCart.mutate({
      productId: product.id,
      variant: Object.keys(selectedVariants).length > 0 ? selectedVariants : undefined,
      quantity,
    });
  };

  return (
    <>
      <Helmet>
        <title>{product.name} - HALA MADRID TV Shop</title>
        <meta name="description" content={product.description || `Achetez ${product.name} sur HALA MADRID TV`} />
      </Helmet>

      <div className="min-h-screen bg-background">
        <Navbar />

        <div className="container mx-auto px-4 py-8">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
            <Link to="/shop" className="hover:text-primary transition-colors flex items-center gap-1">
              <ChevronLeft className="h-4 w-4" /> Boutique
            </Link>
            <span>/</span>
            <span className="text-foreground truncate">{product.name}</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            {/* Gallery */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-3"
            >
              <div className="aspect-square rounded-xl overflow-hidden bg-card border border-border">
                <img
                  src={images[selectedImage]}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>
              {images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {images.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedImage(i)}
                      className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${
                        i === selectedImage ? "border-primary" : "border-border"
                      }`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Product Info */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <div>
                <Badge variant="outline" className="mb-2 text-xs uppercase">
                  {product.category}
                </Badge>
                <h1 className="font-montserrat font-extrabold text-2xl sm:text-3xl text-foreground">
                  {product.name}
                </h1>

                {/* Stock status */}
                <div className="flex items-center gap-2 mt-2">
                  {product.stock > 0 ? (
                    <span className="flex items-center gap-1 text-xs text-primary">
                      <Check className="h-3 w-3" /> En stock
                      {product.stock <= 5 && (
                        <span className="text-destructive ml-1">
                          (Plus que {product.stock} !)
                        </span>
                      )}
                    </span>
                  ) : (
                    <span className="text-xs text-destructive font-semibold">Rupture de stock</span>
                  )}
                </div>
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-3">
                <span className="font-montserrat font-extrabold text-3xl text-foreground">
                  {product.price.toFixed(2)}€
                </span>
                {product.compare_price && (
                  <>
                    <span className="text-lg text-muted-foreground line-through">
                      {product.compare_price.toFixed(2)}€
                    </span>
                    <Badge variant="destructive" className="text-xs">-{discount}%</Badge>
                  </>
                )}
              </div>

              {/* Description */}
              {product.description && (
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {product.description}
                </p>
              )}

              {/* Variants */}
              {product.variants.map((variant) => (
                <div key={variant.id} className="space-y-2">
                  <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                    {variant.name}
                    {selectedVariants[variant.name] && (
                      <span className="text-xs font-normal text-muted-foreground">
                        : {selectedVariants[variant.name]}
                      </span>
                    )}
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {variant.options.map((opt) => (
                      <button
                        key={opt}
                        onClick={() => setSelectedVariants((prev) => ({ ...prev, [variant.name]: opt }))}
                        className={`px-3 py-1.5 rounded-lg border text-sm transition-colors ${
                          selectedVariants[variant.name] === opt
                            ? "border-primary bg-primary/10 text-primary font-semibold"
                            : "border-border text-foreground hover:border-primary/40"
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              ))}

              {/* Quantity + Add to cart */}
              <div className="flex items-center gap-4">
                <div className="flex items-center border border-border rounded-lg">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-2 hover:bg-muted transition-colors"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="px-4 font-semibold text-foreground">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    className="p-2 hover:bg-muted transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>

                <Button
                  size="lg"
                  className="flex-1 gap-2 font-montserrat font-semibold"
                  onClick={handleAddToCart}
                  disabled={addToCart.isPending || product.stock <= 0}
                >
                  <ShoppingCart className="h-5 w-5" />
                  {product.stock <= 0 ? "Rupture de stock" : "Ajouter au panier"}
                </Button>

                <motion.div whileTap={{ scale: 0.85 }}>
                  <Button
                    size="icon"
                    variant={isInWishlist(product.id) ? "destructive" : "outline"}
                    className="h-11 w-11"
                    onClick={() => toggleWishlist.mutate(product.id)}
                  >
                    <Heart className={`h-5 w-5 ${isInWishlist(product.id) ? "fill-current" : ""}`} />
                  </Button>
                </motion.div>
              </div>

              {/* Trust badges */}
              <div className="grid grid-cols-3 gap-3 pt-4 border-t border-border">
                <div className="flex flex-col items-center gap-1 text-center">
                  <Truck className="h-5 w-5 text-primary" />
                  <span className="text-[10px] text-muted-foreground">Livraison mondiale</span>
                </div>
                <div className="flex flex-col items-center gap-1 text-center">
                  <Shield className="h-5 w-5 text-primary" />
                  <span className="text-[10px] text-muted-foreground">Paiement sécurisé</span>
                </div>
                <div className="flex flex-col items-center gap-1 text-center">
                  <RotateCcw className="h-5 w-5 text-primary" />
                  <span className="text-[10px] text-muted-foreground">Retour 30 jours</span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Reviews section */}
          <div className="mt-16">
            <ShopReviews productId={product.id} />
          </div>

          {/* Related products */}
          {related.length > 0 && (
            <section className="mt-16 space-y-6">
              <h2 className="font-montserrat font-bold text-xl text-foreground">
                Produits similaires
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {related.map((p) => (
                  <ShopProductCard
                    key={p.id}
                    product={p}
                    onAddToCart={(id) => addToCart.mutate({ productId: id })}
                    isWishlisted={isInWishlist(p.id)}
                    onToggleWishlist={(id) => toggleWishlist.mutate(id)}
                  />
                ))}
              </div>
            </section>
          )}
        </div>

        <Footer />
      </div>
    </>
  );
};

export default ShopProduct;
