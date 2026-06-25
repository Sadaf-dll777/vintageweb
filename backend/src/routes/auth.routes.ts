import { Router } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { one } from "../db";
import { requireAdmin, signAdminToken } from "../auth";

const router = Router();

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

router.post("/login", async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid input" });

  const admin = await one<{ id: string; email: string; password_hash: string }>(
    "SELECT id, email, password_hash FROM admins WHERE email = $1",
    [parsed.data.email.toLowerCase()],
  );
  if (!admin) return res.status(401).json({ error: "Invalid credentials" });

  const ok = await bcrypt.compare(parsed.data.password, admin.password_hash);
  if (!ok) return res.status(401).json({ error: "Invalid credentials" });

  const token = signAdminToken({ sub: admin.id, email: admin.email });
  res.json({ token, admin: { id: admin.id, email: admin.email } });
});

router.get("/me", requireAdmin, (req, res) => {
  res.json({ admin: req.admin });
});

export default router;