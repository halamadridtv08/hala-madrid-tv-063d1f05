import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { SlidersHorizontal, X, RotateCcw } from "lucide-react";
import { SHOP_CATEGORIES } from "@/types/Shop";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";

export interface ShopFilterState {
  category: string;
  priceRange: [number, number];
  sizes: string[];
  colors: string[];
  sortBy: string;
  inStockOnly: boolean;
}

const defaultFilters: ShopFilterState = {
  category: "all",
  priceRange: [0, 500],
  sizes: [],
  colors: [],
  sortBy: "newest",
  inStockOnly: false,
};

const AVAILABLE_SIZES = ["XS", "S", "M", "L", "XL", "XXL"];
const AVAILABLE_COLORS = [
  { name: "Blanc", value: "#FFFFFF" },
  { name: "Noir", value: "#000000" },
  { name: "Rouge", value: "#DC2626" },
  { name: "Bleu", value: "#2563EB" },
  { name: "Or", value: "#D4A843" },
  { name: "Rose", value: "#EC4899" },
  { name: "Vert", value: "#16A34A" },
  { name: "Violet", value: "#7C3AED" },
];

interface ShopAdvancedFiltersProps {
  filters: ShopFilterState;
  onFiltersChange: (filters: ShopFilterState) => void;
  totalResults: number;
}

export const ShopAdvancedFilters = ({ filters, onFiltersChange, totalResults }: ShopAdvancedFiltersProps) => {
  const [open, setOpen] = useState(false);

  const activeFilterCount = [
    filters.category !== "all",
    filters.priceRange[0] > 0 || filters.priceRange[1] < 500,
    filters.sizes.length > 0,
    filters.colors.length > 0,
    filters.inStockOnly,
  ].filter(Boolean).length;

  const toggleSize = (size: string) => {
    const newSizes = filters.sizes.includes(size)
      ? filters.sizes.filter((s) => s !== size)
      : [...filters.sizes, size];
    onFiltersChange({ ...filters, sizes: newSizes });
  };

  const toggleColor = (color: string) => {
    const newColors = filters.colors.includes(color)
      ? filters.colors.filter((c) => c !== color)
      : [...filters.colors, color];
    onFiltersChange({ ...filters, colors: newColors });
  };

  const resetFilters = () => onFiltersChange(defaultFilters);

  return (
    <div className="space-y-4">
      {/* Top bar: categories + filter toggle */}
      <div className="flex flex-col gap-4">
        {/* Category pills */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0 sm:flex-wrap">
          <button
            onClick={() => onFiltersChange({ ...filters, category: "all" })}
            className={`flex-shrink-0 px-5 py-2.5 text-xs font-bold uppercase tracking-[0.15em] transition-all duration-200 border ${
              filters.category === "all"
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
              onClick={() => onFiltersChange({ ...filters, category: cat.value })}
              className={`flex-shrink-0 px-5 py-2.5 text-xs font-bold uppercase tracking-[0.15em] transition-all duration-200 border flex items-center gap-2 ${
                filters.category === cat.value
                  ? "bg-foreground text-background border-foreground"
                  : "bg-transparent text-foreground border-border hover:border-foreground"
              }`}
            >
              <span>{cat.icon}</span>
              {cat.label}
            </motion.button>
          ))}
        </div>

        {/* Sort + filter button row */}
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
            {totalResults} produit{totalResults > 1 ? "s" : ""}
          </p>

          <div className="flex items-center gap-2">
            {/* Sort select */}
            <select
              value={filters.sortBy}
              onChange={(e) => onFiltersChange({ ...filters, sortBy: e.target.value })}
              className="h-10 px-3 text-xs font-bold uppercase tracking-wider border border-border bg-card text-foreground appearance-none cursor-pointer"
            >
              <option value="newest">Plus récents</option>
              <option value="price-asc">Prix ↑</option>
              <option value="price-desc">Prix ↓</option>
              <option value="popular">Populaires</option>
            </select>

            {/* Filter sheet trigger */}
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" className="rounded-none h-10 gap-2 text-xs font-bold uppercase tracking-wider relative">
                  <SlidersHorizontal className="h-3.5 w-3.5" />
                  Filtres
                  {activeFilterCount > 0 && (
                    <Badge className="rounded-full px-1.5 py-0 text-[9px] ml-1 bg-primary text-primary-foreground">
                      {activeFilterCount}
                    </Badge>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-full sm:max-w-md p-0">
                <div className="flex flex-col h-full">
                  <SheetHeader className="px-6 py-5 border-b border-border">
                    <div className="flex items-center justify-between">
                      <SheetTitle className="font-montserrat font-black text-lg uppercase tracking-wider">
                        Filtres
                      </SheetTitle>
                      {activeFilterCount > 0 && (
                        <button
                          onClick={resetFilters}
                          className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 uppercase tracking-wider"
                        >
                          <RotateCcw className="h-3 w-3" />
                          Réinitialiser
                        </button>
                      )}
                    </div>
                  </SheetHeader>

                  <div className="flex-1 overflow-y-auto px-6 py-6 space-y-8">
                    {/* Price range */}
                    <div className="space-y-4">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">Prix</h3>
                      <Slider
                        value={filters.priceRange}
                        onValueChange={(val) => onFiltersChange({ ...filters, priceRange: val as [number, number] })}
                        min={0}
                        max={500}
                        step={5}
                        className="w-full"
                      />
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-montserrat font-bold text-foreground">{filters.priceRange[0]} €</span>
                        <span className="text-muted-foreground">—</span>
                        <span className="font-montserrat font-bold text-foreground">{filters.priceRange[1]} €</span>
                      </div>
                    </div>

                    {/* Sizes */}
                    <div className="space-y-3">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">Taille</h3>
                      <div className="grid grid-cols-3 gap-2">
                        {AVAILABLE_SIZES.map((size) => (
                          <button
                            key={size}
                            onClick={() => toggleSize(size)}
                            className={`py-2.5 text-xs font-bold uppercase tracking-wider transition-all border ${
                              filters.sizes.includes(size)
                                ? "border-foreground bg-foreground text-background"
                                : "border-border text-foreground hover:border-foreground"
                            }`}
                          >
                            {size}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Colors */}
                    <div className="space-y-3">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">Couleur</h3>
                      <div className="flex flex-wrap gap-3">
                        {AVAILABLE_COLORS.map((color) => (
                          <button
                            key={color.name}
                            onClick={() => toggleColor(color.name)}
                            className="flex flex-col items-center gap-1.5 group"
                            title={color.name}
                          >
                            <span
                              className={`w-9 h-9 rounded-full border-2 transition-all ${
                                filters.colors.includes(color.name)
                                  ? "border-foreground scale-110 ring-2 ring-foreground ring-offset-2 ring-offset-background"
                                  : "border-border group-hover:border-foreground/50"
                              }`}
                              style={{ backgroundColor: color.value }}
                            />
                            <span className="text-[9px] text-muted-foreground">{color.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* In stock toggle */}
                    <div className="space-y-3">
                      <button
                        onClick={() => onFiltersChange({ ...filters, inStockOnly: !filters.inStockOnly })}
                        className={`w-full py-3 text-xs font-bold uppercase tracking-wider transition-all border flex items-center justify-center gap-2 ${
                          filters.inStockOnly
                            ? "border-foreground bg-foreground text-background"
                            : "border-border text-foreground hover:border-foreground"
                        }`}
                      >
                        {filters.inStockOnly ? "✓ " : ""}En stock uniquement
                      </button>
                    </div>
                  </div>

                  {/* Apply button */}
                  <div className="px-6 py-4 border-t border-border">
                    <Button
                      className="w-full rounded-none h-12 font-montserrat font-bold text-sm uppercase tracking-wider"
                      onClick={() => setOpen(false)}
                    >
                      Voir {totalResults} résultat{totalResults > 1 ? "s" : ""}
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>

      {/* Active filters pills */}
      {activeFilterCount > 0 && (
        <div className="flex flex-wrap gap-2">
          {filters.priceRange[0] > 0 || filters.priceRange[1] < 500 ? (
            <Badge variant="secondary" className="rounded-none gap-1 text-[10px] font-bold uppercase tracking-wider py-1 px-3">
              {filters.priceRange[0]}€ - {filters.priceRange[1]}€
              <button onClick={() => onFiltersChange({ ...filters, priceRange: [0, 500] })}>
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ) : null}
          {filters.sizes.map((size) => (
            <Badge key={size} variant="secondary" className="rounded-none gap-1 text-[10px] font-bold uppercase tracking-wider py-1 px-3">
              {size}
              <button onClick={() => toggleSize(size)}>
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
          {filters.colors.map((color) => (
            <Badge key={color} variant="secondary" className="rounded-none gap-1 text-[10px] font-bold uppercase tracking-wider py-1 px-3">
              {color}
              <button onClick={() => toggleColor(color)}>
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
          {filters.inStockOnly && (
            <Badge variant="secondary" className="rounded-none gap-1 text-[10px] font-bold uppercase tracking-wider py-1 px-3">
              En stock
              <button onClick={() => onFiltersChange({ ...filters, inStockOnly: false })}>
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          <button
            onClick={resetFilters}
            className="text-[10px] font-bold uppercase tracking-wider text-destructive hover:underline px-2"
          >
            Tout effacer
          </button>
        </div>
      )}
    </div>
  );
};
