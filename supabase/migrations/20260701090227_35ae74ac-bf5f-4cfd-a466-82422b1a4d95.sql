
-- 1. Restrict option_presets read access to admins only
DROP POLICY IF EXISTS "Anyone can view presets" ON public.option_presets;
CREATE POLICY "Admins can view presets" ON public.option_presets
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));
REVOKE SELECT ON public.option_presets FROM anon;

-- 2. Add user_id ownership to orders, bind to auth.uid() on insert
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS orders_user_id_idx ON public.orders(user_id);

-- Backfill from auth.users by email where possible
UPDATE public.orders o
SET user_id = u.id
FROM auth.users u
WHERE o.user_id IS NULL AND lower(o.user_email) = lower(u.email);

-- Replace insert policy: authenticated users must insert with their own uid + matching email
DROP POLICY IF EXISTS "Anyone can place an order" ON public.orders;
CREATE POLICY "Authenticated users place own orders" ON public.orders
  FOR INSERT TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    AND lower(user_email) = lower(COALESCE(auth.jwt() ->> 'email', ''))
  );

-- Replace SELECT policy: match by user_id (email fallback removed to prevent bypass)
DROP POLICY IF EXISTS "Users can view own orders by email" ON public.orders;
CREATE POLICY "Users view own orders" ON public.orders
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- Remove anon insert grant (orders now require auth)
REVOKE INSERT ON public.orders FROM anon;
