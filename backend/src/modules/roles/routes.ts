import type { FastifyInstance } from 'fastify';
import { db } from '../../db/index.js';
import { role, permission, rolePermission } from '../../db/schema.js';
import { eq } from 'drizzle-orm';
import { requirePermission } from '../../middleware/auth.js';
import { z } from 'zod';

export async function roleRoutes(app: FastifyInstance) {
  app.get('/api/roles', { preHandler: requirePermission('roles.read') }, async () => db.select().from(role));
  app.get('/api/permissions', { preHandler: requirePermission('roles.read') }, async () => db.select().from(permission));

  app.post('/api/roles', { preHandler: requirePermission('roles.write') }, async (req) => {
    const body = z.object({ name: z.string().min(2), description: z.string().optional() }).parse(req.body);
    const [r] = await db.insert(role).values(body).returning();
    return r;
  });

  app.post('/api/roles/:id/permissions', { preHandler: requirePermission('roles.write') }, async (req) => {
    const { id } = req.params as { id: string };
    const { permissionKey } = z.object({ permissionKey: z.string() }).parse(req.body);
    const [p] = await db.select().from(permission).where(eq(permission.key, permissionKey));
    if (!p) return { error: 'permission_not_found' };
    await db.insert(rolePermission).values({ roleId: id, permissionId: p.id }).onConflictDoNothing();
    return { ok: true };
  });
}
