-- =========================================================
-- Enums
-- =========================================================
DO $$ BEGIN
  CREATE TYPE public.order_status AS ENUM ('review','verified','processing','completed','cancelled');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- =========================================================
-- updated_at trigger helper
-- =========================================================
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- =========================================================
-- CATEGORIES
-- =========================================================
CREATE TABLE public.categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  emoji text NOT NULL DEFAULT '',
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.categories TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.categories TO authenticated;
GRANT ALL ON public.categories TO service_role;

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Categories are viewable by everyone"
  ON public.categories FOR SELECT
  USING (true);

CREATE POLICY "Admins can insert categories"
  ON public.categories FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update categories"
  ON public.categories FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete categories"
  ON public.categories FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER trg_categories_updated_at
  BEFORE UPDATE ON public.categories
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- =========================================================
-- PRODUCTS
-- =========================================================
CREATE TABLE public.products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  category_id uuid REFERENCES public.categories(id) ON DELETE SET NULL,
  description text NOT NULL DEFAULT '',
  price_bdt numeric(10,2) NOT NULL DEFAULT 0,
  image_url text NOT NULL DEFAULT '',
  badge text NOT NULL DEFAULT '',
  stock int NOT NULL DEFAULT 0,
  sort_order int NOT NULL DEFAULT 0,
  delivery text NOT NULL DEFAULT '',
  tagline text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_products_category_id ON public.products(category_id);
CREATE INDEX idx_products_sort_order ON public.products(sort_order);

GRANT SELECT ON public.products TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.products TO authenticated;
GRANT ALL ON public.products TO service_role;

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Products are viewable by everyone"
  ON public.products FOR SELECT
  USING (true);

CREATE POLICY "Admins can insert products"
  ON public.products FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update products"
  ON public.products FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete products"
  ON public.products FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER trg_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- =========================================================
-- ORDERS
-- =========================================================
CREATE TABLE public.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_email text NOT NULL DEFAULT '',
  customer_name text NOT NULL DEFAULT '',
  contact text NOT NULL DEFAULT '',
  items jsonb NOT NULL DEFAULT '[]'::jsonb,
  total_usd numeric(10,2) NOT NULL DEFAULT 0,
  total_bdt numeric(10,2) NOT NULL DEFAULT 0,
  payment_method text NOT NULL DEFAULT '',
  payment_proof_url text NOT NULL DEFAULT '',
  transaction_id text NOT NULL DEFAULT '',
  sender_number text NOT NULL DEFAULT '',
  notes text NOT NULL DEFAULT '',
  status public.order_status NOT NULL DEFAULT 'review',
  delivered_key text NOT NULL DEFAULT '',
  key_instructions text NOT NULL DEFAULT '',
  key_redeem_label text NOT NULL DEFAULT '',
  notes_thread jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_orders_created_at ON public.orders(created_at DESC);
CREATE INDEX idx_orders_status ON public.orders(status);

GRANT INSERT ON public.orders TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.orders TO authenticated;
GRANT ALL ON public.orders TO service_role;

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Anyone (guest checkout) can create an order
CREATE POLICY "Anyone can place an order"
  ON public.orders FOR INSERT
  WITH CHECK (true);

-- Only admins can list / view / change orders
CREATE POLICY "Admins can view orders"
  ON public.orders FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update orders"
  ON public.orders FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete orders"
  ON public.orders FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER trg_orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- =========================================================
-- SITE CONTENT (single-row JSON blob)
-- =========================================================
CREATE TABLE public.site_content (
  id int PRIMARY KEY DEFAULT 1,
  content jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT site_content_singleton CHECK (id = 1)
);

GRANT SELECT ON public.site_content TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.site_content TO authenticated;
GRANT ALL ON public.site_content TO service_role;

ALTER TABLE public.site_content ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Site content viewable by everyone"
  ON public.site_content FOR SELECT
  USING (true);

CREATE POLICY "Admins can insert site content"
  ON public.site_content FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update site content"
  ON public.site_content FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER trg_site_content_updated_at
  BEFORE UPDATE ON public.site_content
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

INSERT INTO public.site_content (id, content) VALUES (1, '{}'::jsonb)
ON CONFLICT (id) DO NOTHING;
