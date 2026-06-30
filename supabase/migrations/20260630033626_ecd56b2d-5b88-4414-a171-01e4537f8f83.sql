
-- Add options column to products (array of {label, price_bdt, out_of_stock})
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS options jsonb NOT NULL DEFAULT '[]'::jsonb;

-- Reusable variant/duration presets, manageable from admin
CREATE TABLE IF NOT EXISTS public.option_presets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  options jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.option_presets TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.option_presets TO authenticated;
GRANT ALL ON public.option_presets TO service_role;

ALTER TABLE public.option_presets ENABLE ROW LEVEL SECURITY;

-- Public can read presets (used to render product options on the storefront indirectly via admin choices)
CREATE POLICY "Anyone can view presets"
  ON public.option_presets FOR SELECT
  USING (true);

-- Only admins manage presets
CREATE POLICY "Admins can insert presets"
  ON public.option_presets FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update presets"
  ON public.option_presets FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete presets"
  ON public.option_presets FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER option_presets_set_updated_at
  BEFORE UPDATE ON public.option_presets
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
