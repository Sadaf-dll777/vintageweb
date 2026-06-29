-- product-images: public read, admin write
CREATE POLICY "Product images public read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'product-images');

CREATE POLICY "Admins upload product images"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'product-images' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins update product images"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'product-images' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins delete product images"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'product-images' AND public.has_role(auth.uid(), 'admin'));

-- payment-proofs: anyone can upload (guest checkout), only admins can read/manage
CREATE POLICY "Anyone uploads payment proofs"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'payment-proofs');

CREATE POLICY "Admins read payment proofs"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'payment-proofs' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins delete payment proofs"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'payment-proofs' AND public.has_role(auth.uid(), 'admin'));
