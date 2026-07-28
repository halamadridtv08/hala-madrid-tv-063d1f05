import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;
    if (!user?.email) throw new Error("Utilisateur non authentifié");

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    const { orderId, items, discountCode } = await req.json();

    if (!orderId || !Array.isArray(items) || items.length === 0) {
      throw new Error("Données de commande invalides");
    }

    // Server-side trusted price lookup — never trust client-supplied prices
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Ownership check: order must belong to the authenticated user
    const { data: existingOrder, error: orderErr } = await supabaseAdmin
      .from("shop_orders")
      .select("id, user_id")
      .eq("id", orderId)
      .maybeSingle();
    if (orderErr) throw new Error("Impossible de vérifier la commande");
    if (!existingOrder || existingOrder.user_id !== user.id) {
      return new Response(JSON.stringify({ error: "Commande introuvable" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 403,
      });
    }

    type ClientItem = { productId?: string; product_id?: string; quantity: number };
    const normalized: { productId: string; quantity: number }[] = items.map((i: ClientItem) => {
      const productId = i.productId || i.product_id;
      const quantity = Math.max(1, Math.min(99, Math.floor(Number(i.quantity) || 0)));
      if (!productId || quantity < 1) throw new Error("Article invalide dans la commande");
      return { productId, quantity };
    });

    const { data: products, error: productsErr } = await supabaseAdmin
      .from("shop_products")
      .select("id, name, price")
      .in("id", normalized.map((i) => i.productId));

    if (productsErr) throw new Error("Impossible de récupérer les produits");
    if (!products || products.length !== new Set(normalized.map((i) => i.productId)).size) {
      throw new Error("Un ou plusieurs produits sont introuvables");
    }

    const productMap = new Map(products.map((p: any) => [p.id, p]));

    // Server-side validated discount lookup
    let discountAmount = 0;
    const subtotal = normalized.reduce((sum, it) => {
      const p: any = productMap.get(it.productId);
      return sum + Number(p.price) * it.quantity;
    }, 0);

    if (discountCode && typeof discountCode === "string") {
      const { data: discount } = await supabaseAdmin
        .from("shop_discount_codes")
        .select("*")
        .eq("code", discountCode.toUpperCase())
        .eq("is_active", true)
        .maybeSingle();
      if (discount) {
        const now = new Date();
        const expiresAt = discount.expires_at ? new Date(discount.expires_at) : null;
        const notExpired = !expiresAt || expiresAt >= now;
        const underLimit = !discount.max_uses || (discount.current_uses ?? 0) < discount.max_uses;
        const meetsMin = !discount.min_order || subtotal >= Number(discount.min_order);
        if (notExpired && underLimit && meetsMin) {
          if (discount.type === "percentage") {
            discountAmount = (subtotal * Number(discount.value)) / 100;
          } else {
            discountAmount = Number(discount.value);
          }
          discountAmount = Math.max(0, Math.min(discountAmount, subtotal));
        }
      }
    }

    // Check for existing Stripe customer
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId: string | undefined;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
    }

    // Build Stripe line items using ONLY server-fetched prices
    const lineItems = normalized.map((it) => {
      const p: any = productMap.get(it.productId);
      return {
        price_data: {
          currency: "eur",
          product_data: { name: p.name },
          unit_amount: Math.round(Number(p.price) * 100),
        },
        quantity: it.quantity,
      };
    });

    // Add discount as negative line item if applicable
    if (discountAmount > 0) {
      lineItems.push({
        price_data: {
          currency: "eur",
          product_data: {
            name: "Réduction",
          },
          unit_amount: -Math.round(discountAmount * 100),
        },
        quantity: 1,
      });
    }

    const origin = req.headers.get("origin") || "https://hala-madrid-tv.lovable.app";

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      line_items: lineItems,
      mode: "payment",
      success_url: `${origin}/shop?payment=success&order=${orderId}`,
      cancel_url: `${origin}/shop/cart?payment=cancelled`,
      metadata: {
        order_id: orderId,
        user_id: user.id,
        discount_amount: discountAmount.toString(),
      },
    });

    await supabaseAdmin
      .from("shop_orders")
      .update({
        payment_intent_id: session.id,
        payment_status: "processing",
      })
      .eq("id", orderId)
      .eq("user_id", user.id);

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error: any) {
    console.error("Checkout error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
