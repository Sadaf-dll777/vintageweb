import type { FastifyInstance } from 'fastify';
import { db } from '../../db/index.js';
import { product, stock } from '../../db/schema.js';
import { eq } from 'drizzle-orm';
import { requirePermission } from '../../middleware/auth.js';
import { cacheGet, cacheSet, cacheDel } from '../../lib/redis.js';
import { z } from 'zod';

const ProductInput = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().optional(),
  priceCents: z.number().int().nonnegative(),
  currency: z.string().default('BDT'),
  categoryId: z.string().uuid().optional(),
  images: z.array(z.string()).default([]),
  isActive: z.boolean().default(true),
  initialStock: z.number().int().nonnegative().default(0),
});

export async function productRoutes(app: FastifyInstance) {
  app.get('/api/products', async (req) => {
    const { categoryId } = (req.query as any) ?? {};
    const cacheKey = `products:list:${categoryId ?? 'all'}`;
    const cached = await cacheGet(cacheKey);
    if (cached) return cached;
    const rows = categoryId
      ? await db.select().from(product).where(eq(product.categoryId, categoryId))
      : await db.select().from(product);
    await cacheSet(cacheKey, rows, 60);
    return rows;
  });

  app.get('/api/products/:slug', async (req, reply) => {
    const { slug } = req.params as { slug: string };
    const [p] = await db.select().from(product).where(eq(product.slug, slug));
    if (!p) return reply.code(404).send({ error: 'not_found' });
    const [s] = await db.select().from(stock).where(eq(stock.productId, p.id));
    return { ...p, stock: s?.quantity ?? 0 };
  });

  app.post('/api/products', { preHandler: requirePermission('products.write') }, async (req) => {
    const { initialStock, ...data } = ProductInput.parse(req.body);
    const [row] = await db.insert(product).values(data).returning();
    await db.insert(stock).values({ productId: row.id, quantity: initialStock });
    await cacheDel('products:*');
    return row;
  });

  app.put('/api/products/:id', { preHandler: requirePermission('products.write') }, async (req) => {
    const { id } = req.params as { id: string };
    const body = ProductInput.partial().omit({ initialStock: true } as any).parse(req.body);
    const [row] = await db.update(product).set({ ...body, updatedAt: new Date() }).where(eq(product.id, id)).returning();
    await cacheDel('products:*');
    return row;
  });

  app.delete('/api/products/:id', { preHandler: requirePermission('products.write') }, async (req) => {
    const { id } = req.params as { id: string };
    await db.delete(product).where(eq(product.id, id));
    await cacheDel('products:*');
    return { ok: true };
  });
}
