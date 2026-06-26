import type { FastifyRequest, FastifyReply } from 'fastify';
import { auth } from '../lib/auth.js';
import { db } from '../db/index.js';
import { userRole, rolePermission, permission, role } from '../db/schema.js';
import { eq, inArray } from 'drizzle-orm';

declare module 'fastify' {
  interface FastifyRequest {
    user?: { id: string; email: string; name: string };
    permissions?: Set<string>;
  }
}

export async function attachSession(req: FastifyRequest, _reply: FastifyReply) {
  try {
    const session = await auth.api.getSession({ headers: req.headers as any });
    if (session?.user) {
      req.user = { id: session.user.id, email: session.user.email, name: session.user.name };
    }
  } catch {}
}

export function requireAuth(req: FastifyRequest, reply: FastifyReply) {
  if (!req.user) return reply.code(401).send({ error: 'unauthorized' });
}

async function loadPermissions(userId: string): Promise<Set<string>> {
  const roles = await db.select({ id: role.id }).from(userRole)
    .innerJoin(role, eq(role.id, userRole.roleId))
    .where(eq(userRole.userId, userId));
  if (!roles.length) return new Set();
  const rps = await db.select({ key: permission.key }).from(rolePermission)
    .innerJoin(permission, eq(permission.id, rolePermission.permissionId))
    .where(inArray(rolePermission.roleId, roles.map(r => r.id)));
  return new Set(rps.map(r => r.key));
}

export function requirePermission(...keys: string[]) {
  return async (req: FastifyRequest, reply: FastifyReply) => {
    if (!req.user) return reply.code(401).send({ error: 'unauthorized' });
    if (!req.permissions) req.permissions = await loadPermissions(req.user.id);
    const ok = keys.some(k => req.permissions!.has(k));
    if (!ok) return reply.code(403).send({ error: 'forbidden', required: keys });
  };
}
