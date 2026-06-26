import type { FastifyInstance } from 'fastify';
import { db } from '../../db/index.js';
import { order, orderItem, product, stock, stockMovement } from '../../db/schema.js';
import { eq, sql, desc } from 'drizzle-orm';
import { requireAuth, requirePermission } from '../../middleware/auth.js';
import { z } from 'zod';

const OrderInput = z.object({
  items: z.array(z.object({ productId: z.string().uuid(), quantity: z.number().int().positive() })).min(1),
  shippingAddress: z.record(z.unknown()).optional(),
  billingAddress: z.record(z.unknown()).optional(),
  notes: z.string().optional(),
});

function genOrderNumber() {
  return `VS-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2,6).toUpperCase()}`;
}

export async function orderRoutes(app: FastifyInstance) {
  // Customer: list own orders
  app.get('/api/orders/mine', { preHandler: requireAuth }, async (req) => {
    return db.select().from(order).where(eq(order.userId, req.user!.id)).orderBy(desc(order.createdAt));
  });

  // Staff: list all
  app.get('/api/orders', { preHandler: requirePermission('orders.read') }, async () => {
    return db.select().from(order).orderBy(desc(order.createdAt)).limit(200);
  });

  app.get('/api/orders/:id', { preHandler: requireAuth }, async (req, reply) => {
    const { id } = req.params as { id: string };
    const [o] = await db.select().from(order).where(eq(order.id, id));
    if (!o) return reply.code(404).send({ error: 'not_found' });
    const isOwner = o.userId === req.user!.id;
    const hasPerm = (req.permissions ?? new Set()).has('orders.read');
    if (!isOwner && !hasPerm) return reply.code(403).send({ error: 'forbidden' });
    const items = await db.select().from(orderItem).where(eq(orderItem.orderId, id));
    return { ...o, items };
  });

  app.post('/api/orders', { preHandler: requireAuth }, async (req, reply) => {
    const body = OrderInput.parse(req.body);

    return db.transaction(async (tx) => {
      let subtotal = 0;
      const lines: typeof orderItem.$inferInsert[] = [];

      for (const item of body.items) {
        const [p] = await tx.select().from(product).where(eq(product.id, item.productId));
        if (!p || !p.isActive) throw reply.code(400).send({ error: 'invalid_product', productId: item.productId });
        const [s] = await tx.select().from(stock).where(eq(stock.productId, p.id));
        if (!s || s.quantity < item.quantity) throw reply.code(400).send({ error: 'insufficient_stock', productId: p.id });
        const total = p.priceCents * item.quantity;
        subtotal += total;
        lines.push({ orderId: '', productId: p.id, productName: p.name, unitPriceCents: p.priceCents, quantity: item.quantity, totalCents: total });
      }

      const [created] = await tx.insert(order).values({
        orderNumber: genOrderNumber(),
        userId: req.user!.id,
        subtotalCents: subtotal,
        totalCents: subtotal,
        shippingAddress: body.shippingAddress,
        billingAddress: body.billingAddress,
        notes: body.notes,
      }).returning();

      for (const line of lines) {
        line.orderId = created.id;
        await tx.insert(orderItem).values(line);
        await tx.update(stock).set({ quantity: sql`${stock.quantity} - ${line.quantity}`, updatedAt: new Date() }).where(eq(stock.productId, line.productId!));
        await tx.insert(stockMovement).values({ productId: line.productId!, delta: -line.quantity, type: 'sale', reason: `order:${created.orderNumber}`, createdBy: req.user!.id });
      }
      return created;
    });
  });

  app.patch('/api/orders/:id/status', { preHandler: requirePermission('orders.write') }, async (req) => {
    const { id } = req.params as { id: string };
    const { status } = z.object({ status: z.enum(['pending','paid','shipped','delivered','cancelled','refunded']) }).parse(req.body);
    const [row] = await db.update(order).set({ status, updatedAt: new Date() }).where(eq(order.id, id)).returning();
    return row;
  });
}
