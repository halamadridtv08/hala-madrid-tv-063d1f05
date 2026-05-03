-- Fix 1: Remove permissive INSERT policy on admin_notifications that allowed anyone to insert
DROP POLICY IF EXISTS "System can insert notifications" ON public.admin_notifications;

-- Fix 2: Restrict public read of shop_discount_codes; only admins can SELECT directly.
-- Validation of codes by customers should be done via a SECURITY DEFINER RPC.
DROP POLICY IF EXISTS "Anyone can view active discount codes" ON public.shop_discount_codes;