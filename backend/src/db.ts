import { Pool } from "pg";
import { env } from "./env";

export const pool = new Pool({ connectionString: env.DATABASE_URL });

export async function query<T = unknown>(text: string, params?: unknown[]) {
  const res = await pool.query(text, params as never);
  return res.rows as T[];
}

export async function one<T = unknown>(text: string, params?: unknown[]) {
  const rows = await query<T>(text, params);
  return rows[0] ?? null;
}