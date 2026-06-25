-- Add BDT pricing and integer stock quantity
ALTER TABLE products ADD COLUMN IF NOT EXISTS price_bdt NUMERIC(12,2) NOT NULL DEFAULT 0;
ALTER TABLE products ADD COLUMN IF NOT EXISTS stock INT NOT NULL DEFAULT 0;

-- Backfill stock from legacy in_stock boolean (10 if true, 0 if false)
UPDATE products SET stock = CASE WHEN in_stock THEN 10 ELSE 0 END WHERE stock = 0;