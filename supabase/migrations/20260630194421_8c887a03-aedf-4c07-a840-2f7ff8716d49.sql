ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS account_fields_enabled boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS account_fields jsonb NOT NULL DEFAULT '[]'::jsonb;