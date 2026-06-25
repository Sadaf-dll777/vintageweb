import fs from "fs";
import path from "path";
import bcrypt from "bcryptjs";
import { pool, query, one } from "../src/db";
import { env } from "../src/env";

async function run() {
  console.log("Running migrations...");
  const migrationsDir = path.join(__dirname, "..", "migrations");
  const files = fs.readdirSync(migrationsDir).filter((f) => f.endsWith(".sql")).sort();
  for (const f of files) {
    console.log(`  → ${f}`);
    const sql = fs.readFileSync(path.join(migrationsDir, f), "utf8");
    await pool.query(sql);
  }

  // Seed admin
  const existing = await one("SELECT id FROM admins WHERE email = $1", [env.ADMIN_EMAIL.toLowerCase()]);
  if (!existing) {
    const hash = await bcrypt.hash(env.ADMIN_PASSWORD, 10);
    await query("INSERT INTO admins (email, password_hash) VALUES ($1, $2)", [
      env.ADMIN_EMAIL.toLowerCase(),
      hash,
    ]);
    console.log(`  ✓ Seeded admin: ${env.ADMIN_EMAIL}`);
  } else {
    console.log(`  ✓ Admin already exists: ${env.ADMIN_EMAIL}`);
  }

  await pool.end();
  console.log("Done.");
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});