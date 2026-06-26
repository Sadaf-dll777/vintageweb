import type { FastifyInstance } from 'fastify';
import { db } from '../../db/index.js';
import { stock, stockMovement } from '../../db/schema.js';
import { eq, sql } from 'drizzle-orm';
import { requirePermission } from '../../middleware/auth.js';
import { z } from 'zod';

export async function stockRoutes(app: FastifyInstance) {
  app.get('/api/stock', { preHandler: requirePermission('stock.read') }, async () => db.select().from(stock));

  app.get('/api/stock/:productId', { preHandler: requirePermission('stock.read') }, async (req) => {
    const { productId } = req.params as { productId: string };
    const [s] = await db.select().from(stock).where(eq(stock.productId, productId));
    const movements = await db.select().from(stockMovement).where(eq(stockMovement.productId, productId)).limit(50);
    return { stock: s, movements };
  });

  app.post('/api/stock/:productId/adjust', { preHandler: requirePermission('stock.write') }, async (req) => {
    const { productId } = req.params as { productId: string };
    const { delta, type, reason } = z.object({
      delta: z.number().int(),
      type: z.enum(['restock','sale','adjustment','return']),
      reason: z.string().optional(),
    }).parse(req.body);

    await db.insert(stock).values({ productId, quantity: delta })
      .onConflictDoUpdate({ target: stock.productId, set: { quantity: sql`${stock.quantity} + ${delta}`, updatedAt: new Date() } });
    await db.insert(stockMovement).values({ productId, delta, type, reason, createdBy: req.user!.id });
    return { ok: true };
  });
}
