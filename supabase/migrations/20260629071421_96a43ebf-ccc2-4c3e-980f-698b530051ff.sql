CREATE POLICY "Users can view own orders by email"
  ON public.orders FOR SELECT TO authenticated
  USING (lower(user_email) = lower(coalesce((auth.jwt() ->> 'email')::text, '')));
