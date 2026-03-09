import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { useShopCart } from "@/hooks/useShopCart";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { CreditCard, Lock, ArrowLeft, Loader2, CheckCircle } from "lucide-react";
import { ShopDiscountInput } from "@/components/shop/ShopDiscountInput";
import type { ShopProduct, ShippingAddress, ShopDiscountCode } from "@/types/Shop";

const ShopCheckout = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { items, cartCount } = useShopCart();
  const [products, setProducts] = useState<Record<string, ShopProduct>>({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [step, setStep] = useState<'shipping' | 'payment'>('shipping');
  const [appliedDiscount, setAppliedDiscount] = useState<ShopDiscountCode | null>(null);
  const [address, setAddress] = useState<ShippingAddress>({
    name: '',
    line1: '',
    line2: '',
    city: '',
    state: '',
    postal_code: '',
    country: 'FR',
  });

  useEffect(() => {
    if (!user) {
      toast.error("Connectez-vous pour passer commande");
      navigate("/shop/cart");
    }
  }, [user, navigate]);

  useEffect(() => {
    const fetchProducts = async () => {
      if (items.length === 0) return;
      const ids = [...new Set(items.map((i) => i.product_id))];
      const { data } = await supabase.from("shop_products").select("*").in("id", ids);
      if (data) {
        const map: Record<string, ShopProduct> = {};
        data.forEach((p: any) => {
          map[p.id] = { ...p, images: Array.isArray(p.images) ? p.images as unknown as string[] : [], variants: [] } as ShopProduct;
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

  const discountAmount = appliedDiscount
    ? appliedDiscount.type === "percentage"
      ? subtotal * (appliedDiscount.value / 100)
      : Math.min(appliedDiscount.value, subtotal)
    : 0;

  const total = Math.max(0, subtotal - discountAmount);

  const handleCheckout = async () => {
    if (!user) return;
    setIsProcessing(true);

    try {
      // Create order
      const { data: order, error: orderError } = await supabase
        .from("shop_orders")
        .insert({
          user_id: user.id,
          status: "pending",
          total_price: total,
          payment_status: "unpaid",
          shipping_address: address as any,
          discount_code: appliedDiscount?.code || null,
          discount_amount: discountAmount,
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order items
      const orderItems = items.map((item) => ({
        order_id: order.id,
        product_id: item.product_id,
        variant: item.variant,
        quantity: item.quantity,
        unit_price: products[item.product_id]?.price || 0,
      }));

      const { error: itemsError } = await supabase
        .from("shop_order_items")
        .insert(orderItems);

      if (itemsError) throw itemsError;

      // Increment discount usage if applicable
      if (appliedDiscount) {
        await supabase
          .from("shop_discount_codes")
          .update({ current_uses: appliedDiscount.current_uses + 1 })
          .eq("id", appliedDiscount.id);
      }

      // Call Stripe checkout edge function
      const { data: stripeData, error: stripeError } = await supabase.functions.invoke(
        "create-shop-checkout",
        {
          body: {
            orderId: order.id,
            items: items.map((item) => ({
              name: products[item.product_id]?.name || "Produit",
              price: products[item.product_id]?.price || 0,
              quantity: item.quantity,
            })),
            discountAmount,
          },
        }
      );

      if (stripeError) throw stripeError;

      if (stripeData?.url) {
        // Clear cart
        for (const item of items) {
          await supabase.from("shop_cart_items").delete().eq("id", item.id);
        }
        window.location.href = stripeData.url;
      } else {
        throw new Error("Pas d'URL de paiement");
      }
    } catch (error: any) {
      console.error("Checkout error:", error);
      toast.error("Erreur lors du paiement: " + error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  if (cartCount === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-20 text-center space-y-4">
          <CheckCircle className="h-16 w-16 mx-auto text-primary" />
          <h1 className="font-montserrat font-bold text-2xl text-foreground">Panier vide</h1>
          <Link to="/shop"><Button>Retour à la boutique</Button></Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <>
      <Helmet><title>Checkout - HALA MADRID TV Shop</title></Helmet>
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-10 max-w-3xl">
          <Link to="/shop/cart" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary mb-6">
            <ArrowLeft className="h-4 w-4" /> Retour au panier
          </Link>

          <h1 className="font-montserrat font-extrabold text-2xl text-foreground mb-8">Checkout</h1>

          {/* Steps */}
          <div className="flex gap-4 mb-8">
            <button
              onClick={() => setStep('shipping')}
              className={`flex-1 py-2 text-center text-sm font-semibold rounded-lg border transition-colors ${
                step === 'shipping' ? 'bg-primary text-primary-foreground border-primary' : 'border-border text-muted-foreground'
              }`}
            >
              1. Livraison
            </button>
            <button
              onClick={() => step === 'payment' ? setStep('payment') : null}
              className={`flex-1 py-2 text-center text-sm font-semibold rounded-lg border transition-colors ${
                step === 'payment' ? 'bg-primary text-primary-foreground border-primary' : 'border-border text-muted-foreground'
              }`}
            >
              2. Paiement
            </button>
          </div>

          {step === 'shipping' ? (
            <div className="space-y-4 bg-card p-6 rounded-xl border border-border">
              <h2 className="font-montserrat font-bold text-lg text-foreground">Adresse de livraison</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="text-sm font-medium text-foreground">Nom complet *</label>
                  <Input value={address.name} onChange={(e) => setAddress(prev => ({ ...prev, name: e.target.value }))} placeholder="Jean Dupont" />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-sm font-medium text-foreground">Adresse *</label>
                  <Input value={address.line1} onChange={(e) => setAddress(prev => ({ ...prev, line1: e.target.value }))} placeholder="123 rue de Madrid" />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-sm font-medium text-foreground">Complément d'adresse</label>
                  <Input value={address.line2 || ''} onChange={(e) => setAddress(prev => ({ ...prev, line2: e.target.value }))} placeholder="Apt 4B, Bâtiment C..." />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">Ville *</label>
                  <Input value={address.city} onChange={(e) => setAddress(prev => ({ ...prev, city: e.target.value }))} placeholder="Paris" />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">Code postal *</label>
                  <Input value={address.postal_code} onChange={(e) => setAddress(prev => ({ ...prev, postal_code: e.target.value }))} placeholder="75001" />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">Pays *</label>
                  <Input value={address.country} onChange={(e) => setAddress(prev => ({ ...prev, country: e.target.value }))} placeholder="FR" />
                </div>
              </div>
              <Button
                className="w-full font-montserrat font-semibold mt-4"
                size="lg"
                onClick={() => {
                  if (!address.name || !address.line1 || !address.city || !address.postal_code) {
                    toast.error("Remplissez tous les champs obligatoires");
                    return;
                  }
                  setStep('payment');
                }}
              >
                Continuer vers le paiement
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Order summary */}
              <div className="bg-card p-6 rounded-xl border border-border space-y-3">
                <h2 className="font-montserrat font-bold text-lg text-foreground">Résumé de commande</h2>
                {items.map((item) => {
                  const product = products[item.product_id];
                  return (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span className="text-foreground">{product?.name || '...'} × {item.quantity}</span>
                      <span className="text-foreground font-semibold">{((product?.price || 0) * item.quantity).toFixed(2)}€</span>
                    </div>
                  );
                })}
                <div className="h-px bg-border" />

                {/* Discount code */}
                <ShopDiscountInput
                  subtotal={subtotal}
                  onApply={setAppliedDiscount}
                  onRemove={() => setAppliedDiscount(null)}
                  appliedDiscount={appliedDiscount}
                />

                {discountAmount > 0 && (
                  <div className="flex justify-between text-sm text-primary">
                    <span>Réduction</span>
                    <span>-{discountAmount.toFixed(2)}€</span>
                  </div>
                )}

                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Livraison</span>
                  <span className="text-primary font-semibold">Gratuite</span>
                </div>

                <div className="h-px bg-border" />
                <div className="flex justify-between font-montserrat font-bold text-foreground">
                  <span>Total</span>
                  <span>{total.toFixed(2)}€</span>
                </div>
              </div>

              {/* Shipping summary */}
              <div className="bg-card p-4 rounded-xl border border-border text-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-foreground">Livraison à :</span>
                  <button onClick={() => setStep('shipping')} className="text-xs text-primary hover:underline">
                    Modifier
                  </button>
                </div>
                <p className="text-muted-foreground">
                  {address.name}<br />
                  {address.line1}{address.line2 ? `, ${address.line2}` : ''}<br />
                  {address.postal_code} {address.city}, {address.country}
                </p>
              </div>

              <Button
                className="w-full gap-2 font-montserrat font-semibold"
                size="lg"
                onClick={handleCheckout}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <><Loader2 className="h-5 w-5 animate-spin" /> Traitement...</>
                ) : (
                  <><Lock className="h-4 w-4" /> Payer {total.toFixed(2)}€ <CreditCard className="h-4 w-4" /></>
                )}
              </Button>

              <p className="text-center text-[10px] text-muted-foreground">
                🔒 Paiement sécurisé par Stripe. Vos données bancaires ne sont jamais stockées.
              </p>
            </div>
          )}
        </div>
        <Footer />
      </div>
    </>
  );
};

export default ShopCheckout;
