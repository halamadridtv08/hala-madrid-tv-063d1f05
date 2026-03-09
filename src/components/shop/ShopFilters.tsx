import { Input } from "@/components/ui/input";
import { Search, SlidersHorizontal } from "lucide-react";
import { SHOP_CATEGORIES } from "@/types/Shop";
import { motion } from "framer-motion";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ShopFiltersProps {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export const ShopFilters = ({
  selectedCategory,
  onCategoryChange,
  searchQuery,
  onSearchChange,
}: ShopFiltersProps) => {
  return (
    <div className="space-y-6">
      {/* Top bar: search + sort */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:max-w-sm">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-11 h-12 bg-card border-border rounded-none font-montserrat text-sm"
          />
        </div>

        <div className="flex items-center gap-3">
          <SlidersHorizontal className="h-4 w-4 text-muted-foreground hidden sm:block" />
          <Select defaultValue="newest">
            <SelectTrigger className="w-[180px] h-12 rounded-none border-border font-montserrat text-xs uppercase tracking-wider">
              <SelectValue placeholder="Trier par" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Plus récents</SelectItem>
              <SelectItem value="price-asc">Prix croissant</SelectItem>
              <SelectItem value="price-desc">Prix décroissant</SelectItem>
              <SelectItem value="popular">Populaires</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Category pills — horizontal scroll */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0 sm:flex-wrap">
        <button
          onClick={() => onCategoryChange("all")}
          className={`flex-shrink-0 px-5 py-2.5 text-xs font-bold uppercase tracking-[0.15em] transition-all duration-200 border ${
            selectedCategory === "all"
              ? "bg-foreground text-background border-foreground"
              : "bg-transparent text-foreground border-border hover:border-foreground"
          }`}
        >
          Tout voir
        </button>
        {SHOP_CATEGORIES.map((cat) => (
          <motion.button
            key={cat.value}
            whileTap={{ scale: 0.95 }}
            onClick={() => onCategoryChange(cat.value)}
            className={`flex-shrink-0 px-5 py-2.5 text-xs font-bold uppercase tracking-[0.15em] transition-all duration-200 border flex items-center gap-2 ${
              selectedCategory === cat.value
                ? "bg-foreground text-background border-foreground"
                : "bg-transparent text-foreground border-border hover:border-foreground"
            }`}
          >
            <span>{cat.icon}</span>
            {cat.label}
          </motion.button>
        ))}
      </div>
    </div>
  );
};
