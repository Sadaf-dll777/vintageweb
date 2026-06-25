import { Router } from "express";
import { one } from "../db";
import { requireAdmin } from "../auth";

const router = Router();

// Public: get site content blob
router.get("/", async (_req, res) => {
  const row = await one<{ content: unknown }>("SELECT content FROM site_content WHERE id = 1");
  res.json(row?.content ?? {});
});

// Admin: replace site content blob (PUT replaces, PATCH merges client-side then PUT)
router.put("/", requireAdmin, async (req, res) => {
  const content = req.body;
  if (!content || typeof content !== "object") {
    return res.status(400).json({ error: "Body must be an object" });
  }
  await one(
    `INSERT INTO site_content (id, content, updated_at) VALUES (1, $1, now())
     ON CONFLICT (id) DO UPDATE SET content = EXCLUDED.content, updated_at = now()`,
    [JSON.stringify(content)],
  );
  res.json({ ok: true });
});

export default router;