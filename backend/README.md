# VintageStore Backend

Standalone REST API + admin auth for the VintageStore frontend. Plain Node.js + Express + PostgreSQL — no platform lock-in. Drop this folder onto any VPS.

## What's inside

- `src/` — Express app, routes, JWT auth
- `migrations/001_init.sql` — schema (admins, categories, products, orders, site_content)
- `scripts/migrate.ts` — runs migrations and seeds the first admin
- `uploads/` — local storage for payment proof images (served at `/uploads/...`)

## Local dev (on your laptop)

### 1. Install PostgreSQL

Easiest with Docker:

```bash
docker run --name vintage-pg -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=vintagestore -p 5432:5432 -d postgres:16
```

Or install Postgres natively and create a `vintagestore` database.

### 2. Configure

```bash
cd backend
npm install
cp .env.example .env
# edit .env — at minimum change JWT_SECRET and ADMIN_PASSWORD
```

### 3. Migrate + seed admin

```bash
npm run migrate
```

You should see `✓ Seeded admin: admin@vintagestore.local` (or whatever email you set).

### 4. Start the API

```bash
npm run dev
# → API listening on http://localhost:4000
```

### 5. Point the frontend at it

In the project root (NOT inside `backend/`), add to `.env`:

```
VITE_API_URL=http://localhost:4000
```

Restart the frontend dev server. Open `/admin/login`, sign in with the seeded admin, and start adding products.

## Endpoints

Public:
- `GET  /api/health`
- `GET  /api/products` · `GET /api/products/:slug`
- `GET  /api/categories`
- `GET  /api/site`
- `POST /api/orders` — place an order
- `POST /api/upload` — upload payment proof (multipart, field name `file`)

Admin (require `Authorization: Bearer <jwt>`):
- `POST /api/auth/login` — returns `{ token, admin }`
- `GET  /api/auth/me`
- `POST|PUT|DELETE /api/products`
- `POST|PUT|DELETE /api/categories`
- `GET|PATCH|DELETE /api/orders`
- `PUT  /api/site` — replace the site content JSON blob

## Deploying to your VPS (Ubuntu example)

```bash
# 1. Install runtime
sudo apt update && sudo apt install -y nodejs npm postgresql nginx
sudo npm install -g pm2

# 2. Create DB
sudo -u postgres createuser vintage --pwprompt
sudo -u postgres createdb -O vintage vintagestore

# 3. Copy this backend folder to the server, e.g. /opt/vintage-backend
cd /opt/vintage-backend
cp .env.example .env && nano .env   # set DATABASE_URL, JWT_SECRET, ADMIN_PASSWORD, PUBLIC_BASE_URL=https://api.yourdomain.com, CORS_ORIGINS=https://yourdomain.com
npm install
npm run build
npm run migrate

# 4. Run with PM2
pm2 start dist/index.js --name vintage-api
pm2 save
pm2 startup            # follow printed instructions for auto-start

# 5. Nginx reverse proxy (api.yourdomain.com → localhost:4000)
sudo nano /etc/nginx/sites-available/vintage-api
# paste:
#   server {
#     listen 80;
#     server_name api.yourdomain.com;
#     client_max_body_size 10M;
#     location / { proxy_pass http://localhost:4000; proxy_set_header Host $host; }
#   }
sudo ln -s /etc/nginx/sites-available/vintage-api /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx

# 6. HTTPS
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d api.yourdomain.com

# 7. Frontend
# Set VITE_API_URL=https://api.yourdomain.com on your hosting provider and redeploy.
```

## Notes

- Uploaded images are stored on local disk under `uploads/`. For production with multiple servers, swap to S3/R2 later — only `upload.routes.ts` needs to change.
- The `site_content` table is intentionally a single JSON blob so you can iterate on the shape from the admin without migrations.
- Change the JWT secret in production. Tokens last 7 days.