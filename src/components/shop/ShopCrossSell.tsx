import { useFeaturedProducts } from "@/hooks/useShopProducts";
import { ShopProductCard } from "./ShopProductCard";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

export const ShopCrossSell = () => {
  const { data: products = [] } = useFeaturedProducts();

  if (products.length === 0) return null;

  const displayed = products.slice(0, 4);

  return (
    <section className="mt-12 py-8 border-t border-border">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-montserrat font-bold text-lg text-foreground">
          🛍️ Boutique HALA MADRID
        </h2>
        <Link
          to="/shop"
          className="text-sm text-primary hover:underline flex items-center gap-1"
        >
          Voir tout <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {displayed.map((p) => (
          <ShopProductCard key={p.id} product={p} />
        ))}
      </div>
    </section>
  );
};
