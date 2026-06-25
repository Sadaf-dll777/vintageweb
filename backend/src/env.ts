import dotenv from "dotenv";
dotenv.config();

function required(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing required env var: ${name}`);
  return v;
}

export const env = {
  DATABASE_URL: required("DATABASE_URL"),
  JWT_SECRET: required("JWT_SECRET"),
  ADMIN_EMAIL: process.env.ADMIN_EMAIL || "admin@vintagestore.local",
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD || "changeme123",
  PORT: Number(process.env.PORT || 4000),
  CORS_ORIGINS: (process.env.CORS_ORIGINS || "http://localhost:8080")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean),
  PUBLIC_BASE_URL: process.env.PUBLIC_BASE_URL || "http://localhost:4000",
};