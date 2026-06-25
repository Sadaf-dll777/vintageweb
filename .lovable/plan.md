# VPS-Ready Backend + Admin Panel

## What you'll get

A self-contained `backend/` folder you can copy straight to your VPS, plus an `/admin` section in your existing website that talks to it over a REST API. Nothing depends on Lovable Cloud — everything is plain Node.js + PostgreSQL.

## Folder layout

```text
backend/                         ← copy this whole folder to your VPS
  src/
    index.ts                     ← Express app entry
    db.ts                        ← PostgreSQL connection pool
    auth.ts                      ← JWT login + admin middleware
    routes/
      auth.routes.ts             ← POST /api/auth/login, /logout, /me
      products.routes.ts         ← GET/POST/PUT/DELETE /api/products
      categories.routes.ts       ← GET/POST/PUT/DELETE /api/categories
      orders.routes.ts           ← GET /api/orders, POST /api/orders (public)
      site.routes.ts             ← GET/PUT /api/site (hero, reviews, payments, etc.)
      upload.routes.ts           ← POST /api/upload (payment proof images)
  migrations/
    001_init.sql                 ← creates all tables + seed admin user
  uploads/                       ← payment proofs land here (gitignored)
  package.json
  tsconfig.json
  .env.example                   ← DATABASE_URL, JWT_SECRET, ADMIN_PASSWORD, PORT
  README.md                      ← step-by-step VPS deploy guide
```

## Database tables

- `admins` — id, email, password_hash, created_at
- `categories` — id, slug, name, sort_order
- `products` — id, category_id, slug, name, description, price_usd, image_url, badge, in_stock, sort_order
- `orders` — id, customer_name, contact, items (jsonb), total_usd, total_bdt, payment_method, payment_proof_url, status, created_at
- `site_content` — single-row table holding hero/reviews/whyus/partners/payments JSON (easy to edit as one blob)

## Frontend changes

- New file `src/lib/api.ts` — single fetch wrapper pointing at `VITE_API_URL` (defaults to `http://localhost:4000` in dev). Every storefront component that currently reads from `src/config/site.ts` or `src/data/products.ts` switches to calling this.
- Storefront becomes data-driven: `Index`, `Products`, `Reviews`, `Partners`, `WhyUs`, `checkout` all fetch from the API. The existing config files stay as **fallback seed data** so the site keeps working if the API is down.
- New routes:
  - `/admin/login` — email + password form
  - `/admin` — dashboard (counts: products, orders, recent activity)
  - `/admin/products` — table with add/edit/delete + image upload
  - `/admin/categories` — same pattern
  - `/admin/orders` — list orders, view payment proof, change status (pending/paid/delivered/cancelled)
  - `/admin/content` — edit hero text, reviews, why-us, partners, payment numbers
- Admin auth = JWT stored in `localStorage`, attached as `Authorization: Bearer ...` on every admin API call.

## How to run locally (dev)

You'll get a `README.md` with these exact steps:

1. Install Postgres locally (or use Docker: one command provided).
2. `cd backend && npm install && cp .env.example .env`
3. Edit `.env` with your local DB URL.
4. `npm run migrate` — creates tables + seeds an admin (`admin@yourstore.com` / password from `.env`).
5. `npm run dev` — backend on `http://localhost:4000`.
6. In the main project, add `VITE_API_URL=http://localhost:4000` to `.env`. Frontend already runs on 8080.
7. Go to `/admin/login`, sign in, start editing.

## How to deploy to your VPS (later)

The README will walk you through:
- Install Node 20 + Postgres on Ubuntu
- Clone the backend folder, install deps, run migrations
- Run with PM2 (process manager) or systemd
- Nginx reverse proxy + HTTPS via Let's Encrypt
- Point your frontend's `VITE_API_URL` at `https://api.yourdomain.com`

## What I'll do in this build

1. Scaffold the entire `backend/` folder with working code (Express, pg, JWT, multer for uploads, zod validation).
2. Write the SQL migration with all tables + a default admin seeded from `.env`.
3. Build `src/lib/api.ts` in the frontend with typed wrappers for every endpoint.
4. Build all 5 admin pages (`/admin/*`) with TanStack Router routes + simple forms (using your existing shadcn components).
5. Refactor storefront components to fetch from the API, keeping config files as fallback.
6. Write the README with copy-paste-ready VPS deploy commands.

## Important notes

- The backend lives in a separate `backend/` folder, **not** deployed by Lovable. Lovable only runs your frontend. To test the admin while still in Lovable, you'd need to run the backend somewhere reachable (your laptop with a tunnel, or just wait until the VPS is ready).
- Until the backend is deployed, the storefront still works because it falls back to the config files.
- Default admin password goes in `backend/.env` — you change it on first deploy.

## Tech choices (all standard, no lock-in)

- **Express** — simplest Node server, huge community, runs anywhere.
- **node-postgres (`pg`)** — direct SQL, no ORM lock-in. Easy to read/modify.
- **JWT + bcrypt** — standard admin auth.
- **multer** — handles file uploads (payment proofs) to local disk.
- **zod** — input validation, shared shape with frontend.

Approve and I'll build it all in one go.