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
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingCart, Heart, ChevronLeft, Minus, Plus, Truck, Shield, RotateCcw, Check, Info, ChevronRight, ZoomIn } from "lucide-react";
import { ShopProductCard } from "@/components/shop/ShopProductCard";
import { ShopReviews } from "@/components/shop/ShopReviews";
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
  const [isZoomed, setIsZoomed] = useState(false);
  const [activeTab, setActiveTab] = useState<"description" | "features" | "reviews">("description");

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            <div className="aspect-[3/4] bg-muted animate-pulse" />
            <div className="space-y-6 py-8">
              <div className="h-4 bg-muted rounded w-1/4" />
              <div className="h-10 bg-muted rounded w-3/4" />
              <div className="h-8 bg-muted rounded w-1/4" />
              <div className="h-32 bg-muted rounded" />
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
        <div className="container mx-auto px-4 py-20 text-center space-y-4">
          <h1 className="text-3xl font-montserrat font-black text-foreground">Produit non trouvé</h1>
          <Link to="/shop">
            <Button className="rounded-none uppercase tracking-wider font-bold">Retour à la boutique</Button>
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

        {/* Breadcrumb */}
        <div className="border-b border-border">
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center gap-2 text-xs text-muted-foreground uppercase tracking-wider">
              <Link to="/shop" className="hover:text-foreground transition-colors">Boutique</Link>
              <ChevronRight className="h-3 w-3" />
              <span className="text-foreground/60">{product.category}</span>
              <ChevronRight className="h-3 w-3" />
              <span className="text-foreground truncate">{product.name}</span>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8 lg:py-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
            {/* Gallery — Left side */}
            <div className="space-y-3">
              {/* Main image */}
              <motion.div
                layoutId={`product-image-${product.id}`}
                className="relative aspect-[3/4] overflow-hidden bg-muted/30 cursor-zoom-in group"
                onClick={() => setIsZoomed(!isZoomed)}
              >
                <AnimatePresence mode="wait">
                  <motion.img
                    key={selectedImage}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    src={images[selectedImage]}
                    alt={product.name}
                    className={`w-full h-full object-cover transition-transform duration-500 ${
                      isZoomed ? "scale-150 cursor-zoom-out" : "group-hover:scale-105"
                    }`}
                  />
                </AnimatePresence>

                {/* Zoom hint */}
                <div className="absolute bottom-4 right-4 p-2 bg-background/80 backdrop-blur-sm rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                  <ZoomIn className="h-4 w-4 text-foreground" />
                </div>

                {/* Badges */}
                <div className="absolute top-4 left-4 flex flex-col gap-2">
                  {product.is_featured && (
                    <Badge className="bg-foreground text-background text-[9px] font-black uppercase tracking-widest rounded-none px-3 py-1.5">
                      Best Seller
                    </Badge>
                  )}
                  {discount > 0 && (
                    <Badge className="bg-destructive text-destructive-foreground text-[9px] font-black uppercase tracking-widest rounded-none px-3 py-1.5">
                      -{discount}%
                    </Badge>
                  )}
                </div>

                {/* Image nav arrows */}
                {images.length > 1 && (
                  <>
                    <button
                      onClick={(e) => { e.stopPropagation(); setSelectedImage((prev) => (prev === 0 ? images.length - 1 : prev - 1)); }}
                      className="absolute left-3 top-1/2 -translate-y-1/2 p-2 bg-background/80 backdrop-blur-sm hover:bg-background transition-colors"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); setSelectedImage((prev) => (prev === images.length - 1 ? 0 : prev + 1)); }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-background/80 backdrop-blur-sm hover:bg-background transition-colors"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </>
                )}
              </motion.div>

              {/* Thumbnails */}
              {images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {images.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedImage(i)}
                      className={`flex-shrink-0 w-20 h-24 overflow-hidden transition-all ${
                        i === selectedImage ? "ring-2 ring-foreground" : "opacity-50 hover:opacity-100"
                      }`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info — Right side */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="lg:py-4 space-y-6"
            >
              {/* Category + name */}
              <div>
                <p className="text-[11px] text-muted-foreground uppercase tracking-[0.2em] font-medium mb-2">
                  {product.category}
                </p>
                <h1 className="font-montserrat font-black text-2xl sm:text-3xl lg:text-4xl text-foreground leading-tight">
                  {product.name}
                </h1>
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-3 pb-2 border-b border-border">
                <span className="font-montserrat font-black text-3xl text-foreground">
                  {product.price.toFixed(2)} €
                </span>
                {product.compare_price && (
                  <>
                    <span className="text-lg text-muted-foreground line-through">
                      {product.compare_price.toFixed(2)} €
                    </span>
                    <Badge variant="destructive" className="rounded-none text-[10px] font-black">
                      -{discount}%
                    </Badge>
                  </>
                )}
              </div>

              {/* Stock */}
              <div className="flex items-center gap-2">
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
              </div>

              {/* Short description */}
              {product.description && (
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {product.description.substring(0, 200)}
                  {product.description.length > 200 && "..."}
                </p>
              )}

              {/* Variants */}
              {product.variants.map((variant) => (
                <div key={variant.id} className="space-y-3">
                  <label className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-2">
                    {variant.name}
                    {selectedVariants[variant.name] && (
                      <span className="font-normal text-muted-foreground normal-case tracking-normal">
                        — {selectedVariants[variant.name]}
                      </span>
                    )}
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {variant.type === "color" ? (
                      variant.options.map((opt) => (
                        <button
                          key={opt}
                          onClick={() => setSelectedVariants((prev) => ({ ...prev, [variant.name]: opt }))}
                          className={`w-10 h-10 rounded-full border-2 transition-all ${
                            selectedVariants[variant.name] === opt
                              ? "border-foreground scale-110 ring-2 ring-foreground ring-offset-2 ring-offset-background"
                              : "border-border hover:border-foreground/50"
                          }`}
                          style={{ backgroundColor: opt.toLowerCase() }}
                          title={opt}
                        />
                      ))
                    ) : (
                      variant.options.map((opt) => (
                        <button
                          key={opt}
                          onClick={() => setSelectedVariants((prev) => ({ ...prev, [variant.name]: opt }))}
                          className={`min-w-[48px] px-4 py-2.5 text-xs font-bold uppercase tracking-wider transition-all border ${
                            selectedVariants[variant.name] === opt
                              ? "border-foreground bg-foreground text-background"
                              : "border-border text-foreground hover:border-foreground"
                          }`}
                        >
                          {opt}
                        </button>
                      ))
                    )}
                  </div>
                </div>
              ))}

              {/* Quantity + Add to cart */}
              <div className="flex items-stretch gap-3 pt-2">
                <div className="flex items-center border border-border">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-3 hover:bg-muted transition-colors"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="px-5 font-montserrat font-bold text-sm text-foreground min-w-[48px] text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    className="p-3 hover:bg-muted transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>

                <Button
                  size="lg"
                  className="flex-1 gap-2.5 font-montserrat font-bold text-sm uppercase tracking-wider rounded-none h-auto"
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
                    className="h-full w-14 rounded-none"
                    onClick={() => toggleWishlist.mutate(product.id)}
                  >
                    <Heart className={`h-5 w-5 ${isInWishlist(product.id) ? "fill-current" : ""}`} />
                  </Button>
                </motion.div>
              </div>

              {/* Trust badges */}
              <div className="grid grid-cols-3 gap-4 pt-6 border-t border-border">
                {[
                  { icon: Truck, label: "Livraison mondiale", sub: "5-10 jours" },
                  { icon: Shield, label: "Paiement sécurisé", sub: "SSL 256-bit" },
                  { icon: RotateCcw, label: "Retour gratuit", sub: "Sous 30 jours" },
                ].map(({ icon: Icon, label, sub }) => (
                  <div key={label} className="flex flex-col items-center gap-1.5 text-center">
                    <Icon className="h-5 w-5 text-muted-foreground" />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-foreground">{label}</span>
                    <span className="text-[9px] text-muted-foreground">{sub}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Tabs: Description / Features / Reviews */}
          <div className="mt-16 border-t border-border">
            <div className="flex gap-0 border-b border-border">
              {["description", "features", "reviews"].map((tab) => {
                const labels: Record<string, string> = {
                  description: "Description",
                  features: "Caractéristiques",
                  reviews: "Avis clients",
                };
                const show =
                  tab === "description" ? !!product.description :
                  tab === "features" ? (product.features && product.features.length > 0) :
                  true;
                if (!show) return null;
                return (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab as any)}
                    className={`px-6 py-4 text-xs font-bold uppercase tracking-[0.15em] transition-colors border-b-2 -mb-px ${
                      activeTab === tab
                        ? "border-foreground text-foreground"
                        : "border-transparent text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {labels[tab]}
                  </button>
                );
              })}
            </div>

            <div className="py-8">
              {activeTab === "description" && product.description && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="max-w-3xl"
                >
                  <p className="text-foreground/80 leading-relaxed whitespace-pre-wrap text-sm">
                    {product.description}
                  </p>
                </motion.div>
              )}

              {activeTab === "features" && product.features && product.features.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="max-w-3xl"
                >
                  <div className="divide-y divide-border">
                    {product.features.map((feature, index) => (
                      <div key={index} className="flex items-start py-4">
                        <span className="w-1/3 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                          {feature.label}
                        </span>
                        <span className="w-2/3 text-sm text-foreground">{feature.value}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {activeTab === "reviews" && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <ShopReviews productId={product.id} />
                </motion.div>
              )}
            </div>
          </div>

          {/* Related products */}
          {related.length > 0 && (
            <section className="mt-16 pt-16 border-t border-border space-y-8">
              <div className="flex items-center justify-between">
                <h2 className="font-montserrat font-black text-xl uppercase tracking-wider text-foreground">
                  Vous aimerez aussi
                </h2>
                <Link to="/shop" className="text-xs font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors">
                  Tout voir →
                </Link>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-8">
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
