import { useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Helmet } from "react-helmet-async";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Package, ArrowLeft, ShoppingBag } from "lucide-react";
import { motion } from "framer-motion";
import type { ShopOrder } from "@/types/Shop";

const statusLabels: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  pending: { label: "En attente", variant: "outline" },
  confirmed: { label: "Confirmée", variant: "secondary" },
  shipped: { label: "Expédiée", variant: "default" },
  delivered: { label: "Livrée", variant: "default" },
  cancelled: { label: "Annulée", variant: "destructive" },
};

const ShopOrders = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) navigate("/shop");
  }, [user, navigate]);

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["shop-orders", user?.id],
    queryFn: async (): Promise<ShopOrder[]> => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("shop_orders")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data || []) as ShopOrder[];
    },
    enabled: !!user,
  });

  return (
    <>
      <Helmet><title>Mes Commandes - HALA MADRID TV Shop</title></Helmet>
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-10 max-w-3xl">
          <Link to="/shop" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary mb-6">
            <ArrowLeft className="h-4 w-4" /> Retour à la boutique
          </Link>

          <h1 className="font-montserrat font-extrabold text-2xl text-foreground mb-8">
            Mes Commandes
          </h1>

          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-24 bg-muted rounded-xl animate-pulse" />
              ))}
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-20 space-y-4">
              <ShoppingBag className="h-16 w-16 mx-auto text-muted-foreground/40" />
              <h2 className="font-montserrat font-semibold text-lg text-foreground">
                Aucune commande
              </h2>
              <p className="text-muted-foreground text-sm">
                Vous n'avez pas encore passé de commande.
              </p>
              <Link to="/shop"><Button className="mt-2">Explorer la boutique</Button></Link>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order, index) => {
                const st = statusLabels[order.status] || statusLabels.pending;
                return (
                  <motion.div
                    key={order.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="p-5 rounded-xl bg-card border border-border space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Package className="h-5 w-5 text-primary" />
                        <div>
                          <p className="font-montserrat font-semibold text-sm text-foreground">
                            Commande #{order.id.slice(0, 8)}
                          </p>
                          <p className="text-[11px] text-muted-foreground">
                            {new Date(order.created_at).toLocaleDateString("fr-FR", {
                              day: "numeric", month: "long", year: "numeric",
                            })}
                          </p>
                        </div>
                      </div>
                      <Badge variant={st.variant}>{st.label}</Badge>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Total</span>
                      <span className="font-montserrat font-bold text-foreground">
                        {order.total_price.toFixed(2)}€
                      </span>
                    </div>

                    {order.tracking_number && (
                      <p className="text-xs text-muted-foreground">
                        📦 Suivi : <span className="font-mono text-foreground">{order.tracking_number}</span>
                      </p>
                    )}
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
        <Footer />
      </div>
    </>
  );
};

export default ShopOrders;
