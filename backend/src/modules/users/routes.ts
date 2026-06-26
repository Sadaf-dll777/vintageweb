import type { FastifyInstance } from 'fastify';
import { db } from '../../db/index.js';
import { user, userRole, role } from '../../db/schema.js';
import { eq } from 'drizzle-orm';
import { requirePermission } from '../../middleware/auth.js';
import { z } from 'zod';

export async function userRoutes(app: FastifyInstance) {
  app.get('/api/users', { preHandler: requirePermission('users.read') }, async () => {
    return db.select().from(user).limit(200);
  });

  app.get('/api/users/:id', { preHandler: requirePermission('users.read') }, async (req, reply) => {
    const { id } = req.params as { id: string };
    const [u] = await db.select().from(user).where(eq(user.id, id));
    if (!u) return reply.code(404).send({ error: 'not_found' });
    const roles = await db.select({ name: role.name }).from(userRole)
      .innerJoin(role, eq(role.id, userRole.roleId)).where(eq(userRole.userId, id));
    return { ...u, roles: roles.map(r => r.name) };
  });

  app.post('/api/users/:id/roles', { preHandler: requirePermission('roles.write') }, async (req) => {
    const { id } = req.params as { id: string };
    const { roleName } = z.object({ roleName: z.string() }).parse(req.body);
    const [r] = await db.select().from(role).where(eq(role.name, roleName));
    if (!r) return { error: 'role_not_found' };
    await db.insert(userRole).values({ userId: id, roleId: r.id }).onConflictDoNothing();
    return { ok: true };
  });
}
