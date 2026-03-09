import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tag, Loader2, Check, X } from "lucide-react";
import { toast } from "sonner";
import type { ShopDiscountCode } from "@/types/Shop";

interface ShopDiscountInputProps {
  subtotal: number;
  onApply: (discount: ShopDiscountCode) => void;
  onRemove: () => void;
  appliedDiscount: ShopDiscountCode | null;
}

export const ShopDiscountInput = ({ subtotal, onApply, onRemove, appliedDiscount }: ShopDiscountInputProps) => {
  const [code, setCode] = useState("");
  const [isChecking, setIsChecking] = useState(false);

  const handleApply = async () => {
    if (!code.trim()) return;
    setIsChecking(true);

    try {
      const { data, error } = await supabase
        .from("shop_discount_codes")
        .select("*")
        .eq("code", code.trim().toUpperCase())
        .eq("is_active", true)
        .maybeSingle();

      if (error) throw error;
      if (!data) {
        toast.error("Code promo invalide");
        return;
      }

      const discount = data as unknown as ShopDiscountCode;

      // Check expiration
      if (discount.expires_at && new Date(discount.expires_at) < new Date()) {
        toast.error("Ce code promo a expiré");
        return;
      }

      // Check max uses
      if (discount.max_uses && discount.current_uses >= discount.max_uses) {
        toast.error("Ce code promo a atteint son nombre maximum d'utilisations");
        return;
      }

      // Check min order
      if (subtotal < discount.min_order) {
        toast.error(`Commande minimum de ${discount.min_order.toFixed(2)}€ requise`);
        return;
      }

      onApply(discount);
      toast.success(`Code promo "${discount.code}" appliqué !`);
    } catch {
      toast.error("Erreur lors de la vérification du code");
    } finally {
      setIsChecking(false);
    }
  };

  if (appliedDiscount) {
    const discountAmount = appliedDiscount.type === "percentage"
      ? subtotal * (appliedDiscount.value / 100)
      : appliedDiscount.value;

    return (
      <div className="flex items-center justify-between p-3 rounded-lg bg-primary/5 border border-primary/20">
        <div className="flex items-center gap-2">
          <Tag className="h-4 w-4 text-primary" />
          <div>
            <span className="text-sm font-semibold text-primary">{appliedDiscount.code}</span>
            <span className="text-xs text-muted-foreground ml-2">
              -{appliedDiscount.type === "percentage" ? `${appliedDiscount.value}%` : `${appliedDiscount.value.toFixed(2)}€`}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-primary">-{discountAmount.toFixed(2)}€</span>
          <Button size="icon" variant="ghost" className="h-6 w-6" onClick={onRemove}>
            <X className="h-3 w-3" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-2">
      <div className="relative flex-1">
        <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
        <Input
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="Code promo"
          className="pl-9 uppercase text-xs"
          onKeyDown={(e) => e.key === "Enter" && handleApply()}
        />
      </div>
      <Button
        variant="outline"
        size="sm"
        onClick={handleApply}
        disabled={isChecking || !code.trim()}
        className="text-xs"
      >
        {isChecking ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />}
      </Button>
    </div>
  );
};
