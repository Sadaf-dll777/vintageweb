# VintageStore Backend

Fastify + Drizzle ORM + Postgres + Better Auth + Redis + Cloudflare R2 + Resend.

## Foundation domains (this pass)
Auth · Users · Roles & Permissions · Categories · Products · Stock · Orders

Follow-up: Payments · Refunds · Coupons · Analytics · Logs.

## Quick start

```bash
cp .env.example .env
# edit BETTER_AUTH_SECRET (any long random string)
docker compose up -d            # Postgres + Redis
bun install                     # or: npm install
bun run db:generate             # create SQL from schema
bun run db:migrate              # apply
bun run seed                    # default roles + permissions
bun run dev                     # http://localhost:4000
```

R2 and Resend env vars are optional — leave blank to use local stubs
(`uploadObject` no-ops, `sendEmail` logs to console).

## Endpoints (summary)

- `POST /api/auth/sign-up/email`, `POST /api/auth/sign-in/email`, `POST /api/auth/sign-out` — Better Auth
- `GET  /api/me`
- `GET/POST /api/users`, `POST /api/users/:id/roles`
- `GET/POST /api/roles`, `GET /api/permissions`
- `GET/POST/PUT/DELETE /api/categories[/:id]`
- `GET/POST/PUT/DELETE /api/products[/:id]`, `GET /api/products/:slug`
- `GET /api/stock`, `POST /api/stock/:productId/adjust`
- `GET /api/orders`, `GET /api/orders/mine`, `POST /api/orders`, `PATCH /api/orders/:id/status`

## Permission keys
`users.read/write`, `roles.read/write`, `products.read/write`, `categories.read/write`,
`stock.read/write`, `orders.read/write`, `analytics.read`, `logs.read`,
`coupons.write`, `payments.write`, `refunds.write`.

Default roles seeded: `admin` (all), `manager` (catalog + orders), `customer` (read).

## Frontend wiring (next step)
Replace `@/integrations/supabase/client` calls with `fetch('http://localhost:4000/api/...', { credentials: 'include' })`. Better Auth uses cookies; `cors` is set with `credentials: true` against `APP_URL`.
