import { useState, useRef, useEffect } from "react";
import { Search, X, TrendingUp } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { ShopProduct, ShopFeature } from "@/types/Shop";
import { motion, AnimatePresence } from "framer-motion";

interface ShopSearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

const mapProduct = (p: any): ShopProduct => ({
  ...p,
  images: Array.isArray(p.images) ? (p.images as unknown as string[]) : [],
  variants: Array.isArray(p.variants) ? (p.variants as unknown as ShopProduct["variants"]) : [],
  features: Array.isArray(p.features) ? (p.features as unknown as ShopFeature[]) : [],
});

export const ShopSearchBar = ({ value, onChange }: ShopSearchBarProps) => {
  const [isFocused, setIsFocused] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Search suggestions query — debounced via queryKey
  const { data: suggestions = [] } = useQuery({
    queryKey: ["shop-search-suggestions", value],
    queryFn: async (): Promise<ShopProduct[]> => {
      if (!value || value.length < 2) return [];
      const { data, error } = await supabase
        .from("shop_products")
        .select("*")
        .eq("is_published", true)
        .ilike("name", `%${value}%`)
        .limit(5);
      if (error) throw error;
      return (data || []).map(mapProduct);
    },
    enabled: value.length >= 2,
    staleTime: 1000 * 30,
  });

  // Close on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsFocused(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const showDropdown = isFocused && (value.length >= 2 || value.length === 0);
  const trendingSearches = ["Maillot", "Écharpe", "Poster", "Gaming"];

  return (
    <div ref={containerRef} className="relative w-full sm:max-w-md">
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
      <Input
        placeholder="Rechercher un produit..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setIsFocused(true)}
        className="pl-11 pr-10 h-12 bg-card border-border rounded-none font-montserrat text-sm"
      />
      {value && (
        <button
          onClick={() => onChange("")}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-muted rounded-sm transition-colors"
        >
          <X className="h-3.5 w-3.5 text-muted-foreground" />
        </button>
      )}

      <AnimatePresence>
        {showDropdown && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="absolute top-full left-0 right-0 mt-1 bg-card border border-border shadow-xl z-50 max-h-[400px] overflow-y-auto"
          >
            {/* Search suggestions */}
            {suggestions.length > 0 && (
              <div className="p-2">
                {suggestions.map((product) => (
                  <Link
                    key={product.id}
                    to={`/shop/${product.slug}`}
                    onClick={() => setIsFocused(false)}
                    className="flex items-center gap-3 p-2 hover:bg-muted/50 transition-colors"
                  >
                    <div className="w-12 h-14 bg-muted/30 flex-shrink-0 overflow-hidden">
                      <img
                        src={product.images[0] || "/placeholder.svg"}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-muted-foreground uppercase tracking-wider">{product.category}</p>
                      <p className="text-sm font-semibold text-foreground truncate">{product.name}</p>
                      <p className="text-sm font-bold text-foreground">{product.price.toFixed(2)} €</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}

            {/* No results */}
            {value.length >= 2 && suggestions.length === 0 && (
              <div className="p-6 text-center">
                <p className="text-sm text-muted-foreground">Aucun produit trouvé pour "{value}"</p>
              </div>
            )}

            {/* Trending when empty */}
            {value.length < 2 && (
              <div className="p-4">
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5 mb-3">
                  <TrendingUp className="h-3 w-3" />
                  Recherches populaires
                </p>
                <div className="flex flex-wrap gap-2">
                  {trendingSearches.map((term) => (
                    <button
                      key={term}
                      onClick={() => {
                        onChange(term);
                        setIsFocused(false);
                      }}
                      className="px-3 py-1.5 text-xs font-medium border border-border hover:border-foreground hover:bg-foreground hover:text-background transition-all"
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
