import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { useShopCart } from "@/hooks/useShopCart";
import { supabase } from "@/integrations/supabase/client";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Trash2, Minus, Plus, ShoppingBag, ArrowRight, Truck, Shield, Tag } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Progress } from "@/components/ui/progress";
import type { ShopProduct } from "@/types/Shop";

const FREE_SHIPPING_THRESHOLD = 50;

const ShopCart = () => {
  const { items, isLoading, removeFromCart, updateQuantity } = useShopCart();
  const [products, setProducts] = useState<Record<string, ShopProduct>>({});

  useEffect(() => {
    const fetchProducts = async () => {
      if (items.length === 0) return;
      const productIds = [...new Set(items.map((i) => i.product_id))];
      const { data } = await supabase
        .from("shop_products")
        .select("*")
        .in("id", productIds);

      if (data) {
        const map: Record<string, ShopProduct> = {};
        data.forEach((p: any) => {
          map[p.id] = {
            ...p,
            images: Array.isArray(p.images) ? (p.images as unknown as string[]) : [],
            variants: Array.isArray(p.variants) ? p.variants : [],
          } as ShopProduct;
        });
        setProducts(map);
      }
    };
    fetchProducts();
  }, [items]);

  const subtotal = items.reduce((sum, item) => {
    const product = products[item.product_id];
    return sum + (product?.price || 0) * item.quantity;
  }, 0);

  const shippingProgress = Math.min((subtotal / FREE_SHIPPING_THRESHOLD) * 100, 100);
  const remainingForFreeShipping = Math.max(FREE_SHIPPING_THRESHOLD - subtotal, 0);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <>
      <Helmet>
        <title>Panier ({itemCount}) - HALA MADRID TV Shop</title>
      </Helmet>

      <div className="min-h-screen bg-background">
        <Navbar />

        {/* Header */}
        <div className="border-b border-border">
          <div className="container mx-auto px-4 py-6">
            <h1 className="font-montserrat font-black text-2xl sm:text-3xl uppercase tracking-wider text-foreground">
              Panier
              {itemCount > 0 && (
                <span className="text-muted-foreground font-medium text-lg ml-3 normal-case tracking-normal">
                  ({itemCount} article{itemCount > 1 ? "s" : ""})
                </span>
              )}
            </h1>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          {items.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-24 space-y-6"
            >
              <ShoppingBag className="h-20 w-20 mx-auto text-muted-foreground/20" />
              <div>
                <h2 className="font-montserrat font-bold text-xl text-foreground">
                  Votre panier est vide
                </h2>
                <p className="text-muted-foreground text-sm mt-2">
                  Découvrez nos produits exclusifs pour les fans du Real Madrid
                </p>
              </div>
              <Link to="/shop">
                <Button className="gap-2 rounded-none uppercase tracking-wider font-bold px-8 h-12">
                  <ShoppingBag className="h-4 w-4" />
                  Continuer mes achats
                </Button>
              </Link>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
              {/* Cart items */}
              <div className="lg:col-span-2 space-y-0 divide-y divide-border">
                <AnimatePresence>
                  {items.map((item) => {
                    const product = products[item.product_id];
                    if (!product) return null;
                    const image = product.images?.[0] || "/placeholder.svg";
                    const itemTotal = product.price * item.quantity;

                    return (
                      <motion.div
                        key={item.id}
                        layout
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -50 }}
                        className="flex gap-5 py-6"
                      >
                        {/* Image */}
                        <Link to={`/shop/${product.slug}`} className="flex-shrink-0">
                          <div className="w-24 h-32 sm:w-28 sm:h-36 overflow-hidden bg-muted/30">
                            <img
                              src={image}
                              alt={product.name}
                              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                            />
                          </div>
                        </Link>

                        {/* Details */}
                        <div className="flex-1 min-w-0 flex flex-col justify-between">
                          <div>
                            <Link to={`/shop/${product.slug}`}>
                              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{product.category}</p>
                              <h3 className="font-montserrat font-semibold text-sm text-foreground mt-0.5 hover:text-primary transition-colors">
                                {product.name}
                              </h3>
                            </Link>
                            {item.variant && (
                              <div className="flex gap-2 flex-wrap mt-2">
                                {Object.entries(item.variant).map(([key, val]) => (
                                  <span key={key} className="text-[10px] text-muted-foreground border border-border px-2 py-0.5 uppercase tracking-wider">
                                    {key}: {val}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>

                          <div className="flex items-end justify-between mt-4">
                            {/* Quantity controls */}
                            <div className="flex items-center border border-border">
                              <button
                                className="p-2 hover:bg-muted transition-colors"
                                onClick={() => updateQuantity.mutate({ cartItemId: item.id, quantity: item.quantity - 1 })}
                              >
                                <Minus className="h-3 w-3" />
                              </button>
                              <span className="px-4 text-xs font-bold text-foreground min-w-[32px] text-center">
                                {item.quantity}
                              </span>
                              <button
                                className="p-2 hover:bg-muted transition-colors"
                                onClick={() => updateQuantity.mutate({ cartItemId: item.id, quantity: item.quantity + 1 })}
                              >
                                <Plus className="h-3 w-3" />
                              </button>
                            </div>

                            {/* Price + remove */}
                            <div className="flex items-center gap-4">
                              <span className="font-montserrat font-bold text-foreground">
                                {itemTotal.toFixed(2)} €
                              </span>
                              <button
                                className="text-muted-foreground hover:text-destructive transition-colors"
                                onClick={() => removeFromCart.mutate(item.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>

              {/* Order summary */}
              <div className="lg:col-span-1">
                <div className="sticky top-24 space-y-6">
                  <div className="p-6 bg-card border border-border space-y-5">
                    <h2 className="font-montserrat font-black text-sm uppercase tracking-wider text-foreground">
                      Résumé de la commande
                    </h2>

                    {/* Free shipping progress */}
                    <div className="space-y-2 p-4 bg-muted/30 border border-border">
                      <div className="flex items-center gap-2">
                        <Truck className="h-4 w-4 text-primary" />
                        {remainingForFreeShipping > 0 ? (
                          <p className="text-xs text-foreground">
                            Plus que <span className="font-bold">{remainingForFreeShipping.toFixed(2)} €</span> pour la livraison gratuite
                          </p>
                        ) : (
                          <p className="text-xs text-primary font-bold">
                            ✓ Livraison gratuite débloquée !
                          </p>
                        )}
                      </div>
                      <Progress value={shippingProgress} className="h-1.5" />
                    </div>

                    {/* Totals */}
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between text-muted-foreground">
                        <span>Sous-total</span>
                        <span>{subtotal.toFixed(2)} €</span>
                      </div>
                      <div className="flex justify-between text-muted-foreground">
                        <span>Livraison</span>
                        <span className={remainingForFreeShipping <= 0 ? "text-primary font-bold" : ""}>
                          {remainingForFreeShipping <= 0 ? "Gratuite" : "Calculée au checkout"}
                        </span>
                      </div>
                      <div className="h-px bg-border" />
                      <div className="flex justify-between font-montserrat font-black text-foreground text-lg pt-1">
                        <span>Total</span>
                        <span>{subtotal.toFixed(2)} €</span>
                      </div>
                    </div>

                    <Link to="/shop/checkout" className="block">
                      <Button className="w-full gap-2 font-montserrat font-bold text-sm uppercase tracking-wider rounded-none h-14" size="lg">
                        Passer la commande
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </Link>

                    <Link to="/shop" className="block">
                      <Button variant="ghost" className="w-full text-xs uppercase tracking-wider text-muted-foreground hover:text-foreground">
                        Continuer mes achats
                      </Button>
                    </Link>
                  </div>

                  {/* Trust */}
                  <div className="flex items-center justify-center gap-6 py-4">
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <Shield className="h-4 w-4" />
                      <span className="text-[10px] uppercase tracking-wider font-medium">Paiement sécurisé</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <Tag className="h-4 w-4" />
                      <span className="text-[10px] uppercase tracking-wider font-medium">Meilleur prix</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <Footer />
      </div>
    </>
  );
};

export default ShopCart;
