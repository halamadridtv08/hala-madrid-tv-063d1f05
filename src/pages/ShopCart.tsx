import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { useShopCart } from "@/hooks/useShopCart";
import { supabase } from "@/integrations/supabase/client";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Trash2, Minus, Plus, ShoppingBag, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import type { ShopProduct } from "@/types/Shop";

const ShopCart = () => {
  const { items, isLoading, removeFromCart, updateQuantity } = useShopCart();
  const [products, setProducts] = useState<Record<string, ShopProduct>>({});

  // Fetch product details for cart items
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

  return (
    <>
      <Helmet>
        <title>Panier - HALA MADRID TV Shop</title>
      </Helmet>

      <div className="min-h-screen bg-background">
        <Navbar />

        <div className="container mx-auto px-4 py-10">
          <h1 className="font-montserrat font-extrabold text-2xl sm:text-3xl text-foreground mb-8">
            Mon Panier
          </h1>

          {items.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20 space-y-4"
            >
              <ShoppingBag className="h-16 w-16 mx-auto text-muted-foreground/40" />
              <h2 className="font-montserrat font-semibold text-lg text-foreground">
                Votre panier est vide
              </h2>
              <p className="text-muted-foreground text-sm">
                Découvrez nos produits exclusifs pour les fans du Real Madrid
              </p>
              <Link to="/shop">
                <Button className="gap-2 mt-2">
                  <ShoppingBag className="h-4 w-4" />
                  Voir la boutique
                </Button>
              </Link>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Cart items */}
              <div className="lg:col-span-2 space-y-4">
                {items.map((item) => {
                  const product = products[item.product_id];
                  if (!product) return null;
                  const image = product.images?.[0] || "/placeholder.svg";

                  return (
                    <motion.div
                      key={item.id}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="flex gap-4 p-4 rounded-xl bg-card border border-border"
                    >
                      <Link to={`/shop/${product.slug}`} className="flex-shrink-0">
                        <img
                          src={image}
                          alt={product.name}
                          className="w-20 h-20 sm:w-24 sm:h-24 rounded-lg object-cover"
                        />
                      </Link>

                      <div className="flex-1 min-w-0 space-y-2">
                        <Link to={`/shop/${product.slug}`}>
                          <h3 className="font-semibold text-sm text-foreground truncate hover:text-primary transition-colors">
                            {product.name}
                          </h3>
                        </Link>
                        {item.variant && (
                          <div className="flex gap-2 flex-wrap">
                            {Object.entries(item.variant).map(([key, val]) => (
                              <span key={key} className="text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded">
                                {key}: {val}
                              </span>
                            ))}
                          </div>
                        )}
                        <p className="font-montserrat font-bold text-foreground">
                          {product.price.toFixed(2)}€
                        </p>
                      </div>

                      <div className="flex flex-col items-end justify-between">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          onClick={() => removeFromCart.mutate(item.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>

                        <div className="flex items-center border border-border rounded-lg">
                          <button
                            className="p-1 hover:bg-muted transition-colors"
                            onClick={() =>
                              updateQuantity.mutate({ cartItemId: item.id, quantity: item.quantity - 1 })
                            }
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="px-2 text-xs font-semibold text-foreground">{item.quantity}</span>
                          <button
                            className="p-1 hover:bg-muted transition-colors"
                            onClick={() =>
                              updateQuantity.mutate({ cartItemId: item.id, quantity: item.quantity + 1 })
                            }
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Order summary */}
              <div className="lg:col-span-1">
                <div className="sticky top-24 p-6 rounded-xl bg-card border border-border space-y-4">
                  <h2 className="font-montserrat font-bold text-lg text-foreground">Résumé</h2>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between text-muted-foreground">
                      <span>Sous-total</span>
                      <span>{subtotal.toFixed(2)}€</span>
                    </div>
                    <div className="flex justify-between text-muted-foreground">
                      <span>Livraison</span>
                      <span className="text-primary font-semibold">Gratuite</span>
                    </div>
                    <div className="h-px bg-border" />
                    <div className="flex justify-between font-montserrat font-bold text-foreground text-base">
                      <span>Total</span>
                      <span>{subtotal.toFixed(2)}€</span>
                    </div>
                  </div>

                  <Link to="/shop/checkout">
                    <Button className="w-full gap-2 font-montserrat font-semibold" size="lg">
                      Passer la commande
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>

                  <Link to="/shop" className="block">
                    <Button variant="ghost" className="w-full text-sm text-muted-foreground">
                      Continuer mes achats
                    </Button>
                  </Link>
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
