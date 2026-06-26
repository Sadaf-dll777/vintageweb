import type { FastifyInstance } from 'fastify';
import { db } from '../../db/index.js';
import { category } from '../../db/schema.js';
import { eq } from 'drizzle-orm';
import { requirePermission } from '../../middleware/auth.js';
import { cacheGet, cacheSet, cacheDel } from '../../lib/redis.js';
import { z } from 'zod';

const CategoryInput = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  parentId: z.string().uuid().optional(),
  description: z.string().optional(),
});

export async function categoryRoutes(app: FastifyInstance) {
  app.get('/api/categories', async () => {
    const cached = await cacheGet('categories:all');
    if (cached) return cached;
    const rows = await db.select().from(category);
    await cacheSet('categories:all', rows, 120);
    return rows;
  });

  app.post('/api/categories', { preHandler: requirePermission('categories.write') }, async (req) => {
    const body = CategoryInput.parse(req.body);
    const [row] = await db.insert(category).values(body).returning();
    await cacheDel('categories:*');
    return row;
  });

  app.put('/api/categories/:id', { preHandler: requirePermission('categories.write') }, async (req) => {
    const { id } = req.params as { id: string };
    const body = CategoryInput.partial().parse(req.body);
    const [row] = await db.update(category).set({ ...body, updatedAt: new Date() }).where(eq(category.id, id)).returning();
    await cacheDel('categories:*');
    return row;
  });

  app.delete('/api/categories/:id', { preHandler: requirePermission('categories.write') }, async (req) => {
    const { id } = req.params as { id: string };
    await db.delete(category).where(eq(category.id, id));
    await cacheDel('categories:*');
    return { ok: true };
  });
}
