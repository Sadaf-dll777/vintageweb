import { Router } from "express";
import { z } from "zod";
import { one, query } from "../db";
import { requireAdmin } from "../auth";

const router = Router();

router.get("/", async (_req, res) => {
  const rows = await query("SELECT * FROM categories ORDER BY sort_order ASC, name ASC");
  res.json(rows);
});

const schema = z.object({
  slug: z.string().min(1),
  name: z.string().min(1),
  emoji: z.string().optional().default(""),
  sort_order: z.number().int().optional().default(0),
});

router.post("/", requireAdmin, async (req, res) => {
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.message });
  const d = parsed.data;
  const row = await one(
    `INSERT INTO categories (slug, name, emoji, sort_order) VALUES ($1,$2,$3,$4) RETURNING *`,
    [d.slug, d.name, d.emoji, d.sort_order],
  );
  res.status(201).json(row);
});

router.put("/:id", requireAdmin, async (req, res) => {
  const parsed = schema.partial().safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.message });
  const fields = Object.entries(parsed.data);
  if (fields.length === 0) return res.status(400).json({ error: "No fields" });
  const sets = fields.map(([k], i) => `${k} = $${i + 2}`).join(", ");
  const values = fields.map(([, v]) => v);
  const row = await one(
    `UPDATE categories SET ${sets} WHERE id = $1 RETURNING *`,
    [req.params.id, ...values],
  );
  if (!row) return res.status(404).json({ error: "Not found" });
  res.json(row);
});

router.delete("/:id", requireAdmin, async (req, res) => {
  await query("DELETE FROM categories WHERE id = $1", [req.params.id]);
  res.json({ ok: true });
});

export default router;