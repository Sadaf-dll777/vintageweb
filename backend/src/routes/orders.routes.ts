import { Router } from "express";
import { z } from "zod";
import { one, query } from "../db";
import { requireAdmin } from "../auth";

const router = Router();

const orderSchema = z.object({
  customer_name: z.string().min(1).max(200),
  contact: z.string().min(1).max(200),
  items: z.array(z.object({
    product_id: z.string().optional(),
    name: z.string(),
    qty: z.number().int().positive(),
    price_usd: z.number().nonnegative(),
  })).min(1),
  total_usd: z.number().nonnegative(),
  total_bdt: z.number().nonnegative(),
  payment_method: z.string().min(1).max(50),
  payment_proof_url: z.string().url().or(z.literal("")).optional().default(""),
  transaction_id: z.string().max(200).optional().default(""),
  notes: z.string().max(1000).optional().default(""),
});

// Public: place an order
router.post("/", async (req, res) => {
  const parsed = orderSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.message });
  const d = parsed.data;
  const row = await one(
    `INSERT INTO orders
      (customer_name, contact, items, total_usd, total_bdt, payment_method, payment_proof_url, transaction_id, notes, status)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,'pending')
     RETURNING id, created_at, status`,
    [d.customer_name, d.contact, JSON.stringify(d.items), d.total_usd, d.total_bdt, d.payment_method, d.payment_proof_url, d.transaction_id, d.notes],
  );
  res.status(201).json(row);
});

// Admin: list all
router.get("/", requireAdmin, async (_req, res) => {
  const rows = await query("SELECT * FROM orders ORDER BY created_at DESC LIMIT 500");
  res.json(rows);
});

const statusSchema = z.object({
  status: z.enum(["pending", "paid", "delivered", "cancelled"]),
});

router.patch("/:id", requireAdmin, async (req, res) => {
  const parsed = statusSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.message });
  const row = await one(
    "UPDATE orders SET status = $2, updated_at = now() WHERE id = $1 RETURNING *",
    [req.params.id, parsed.data.status],
  );
  if (!row) return res.status(404).json({ error: "Not found" });
  res.json(row);
});

router.delete("/:id", requireAdmin, async (req, res) => {
  await query("DELETE FROM orders WHERE id = $1", [req.params.id]);
  res.json({ ok: true });
});

export default router;