import { Router } from "express";
import { z } from "zod";
import { one, query } from "../db";
import { requireAdmin } from "../auth";

const router = Router();

// Public: list all in-stock products
router.get("/", async (_req, res) => {
  const rows = await query(
    `SELECT p.*, c.slug AS category_slug, c.name AS category_name
     FROM products p
     LEFT JOIN categories c ON c.id = p.category_id
     ORDER BY p.sort_order ASC, p.created_at DESC`,
  );
  res.json(rows);
});

// Public: single product
router.get("/:slug", async (req, res) => {
  const row = await one(
    `SELECT p.*, c.slug AS category_slug, c.name AS category_name
     FROM products p
     LEFT JOIN categories c ON c.id = p.category_id
     WHERE p.slug = $1`,
    [req.params.slug],
  );
  if (!row) return res.status(404).json({ error: "Not found" });
  res.json(row);
});

const productSchema = z.object({
  slug: z.string().min(1),
  name: z.string().min(1),
  category_id: z.string().uuid().nullable().optional(),
  description: z.string().optional().default(""),
  price_usd: z.number().nonnegative(),
  image_url: z.string().url().or(z.literal("")).optional().default(""),
  badge: z.string().optional().default(""),
  in_stock: z.boolean().optional().default(true),
  sort_order: z.number().int().optional().default(0),
  delivery: z.string().optional().default(""),
  tagline: z.string().optional().default(""),
});

router.post("/", requireAdmin, async (req, res) => {
  const parsed = productSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.message });
  const d = parsed.data;
  const row = await one(
    `INSERT INTO products
      (slug, name, category_id, description, price_usd, image_url, badge, in_stock, sort_order, delivery, tagline)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
     RETURNING *`,
    [d.slug, d.name, d.category_id ?? null, d.description, d.price_usd, d.image_url, d.badge, d.in_stock, d.sort_order, d.delivery, d.tagline],
  );
  res.status(201).json(row);
});

router.put("/:id", requireAdmin, async (req, res) => {
  const parsed = productSchema.partial().safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.message });
  const fields = Object.entries(parsed.data);
  if (fields.length === 0) return res.status(400).json({ error: "No fields" });
  const sets = fields.map(([k], i) => `${k} = $${i + 2}`).join(", ");
  const values = fields.map(([, v]) => v);
  const row = await one(
    `UPDATE products SET ${sets}, updated_at = now() WHERE id = $1 RETURNING *`,
    [req.params.id, ...values],
  );
  if (!row) return res.status(404).json({ error: "Not found" });
  res.json(row);
});

router.delete("/:id", requireAdmin, async (req, res) => {
  await query("DELETE FROM products WHERE id = $1", [req.params.id]);
  res.json({ ok: true });
});

export default router;