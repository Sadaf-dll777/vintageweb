import express from "express";
import cors from "cors";
import path from "path";
import { env } from "./env";
import authRoutes from "./routes/auth.routes";
import productsRoutes from "./routes/products.routes";
import categoriesRoutes from "./routes/categories.routes";
import ordersRoutes from "./routes/orders.routes";
import siteRoutes from "./routes/site.routes";
import uploadRoutes from "./routes/upload.routes";

const app = express();

app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin) return cb(null, true);
      if (env.CORS_ORIGINS.includes(origin)) return cb(null, true);
      cb(new Error(`CORS: ${origin} not allowed`));
    },
    credentials: true,
  }),
);
app.use(express.json({ limit: "2mb" }));

// Serve uploaded files
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

app.get("/api/health", (_req, res) => res.json({ ok: true }));

app.use("/api/auth", authRoutes);
app.use("/api/products", productsRoutes);
app.use("/api/categories", categoriesRoutes);
app.use("/api/orders", ordersRoutes);
app.use("/api/site", siteRoutes);
app.use("/api/upload", uploadRoutes);

// Error handler
app.use(
  (
    err: Error,
    _req: express.Request,
    res: express.Response,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _next: express.NextFunction,
  ) => {
    console.error(err);
    res.status(500).json({ error: err.message || "Server error" });
  },
);

app.listen(env.PORT, () => {
  console.log(`API listening on http://localhost:${env.PORT}`);
});