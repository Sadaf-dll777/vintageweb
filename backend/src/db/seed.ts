import { db } from './index.js';
import { role, permission, rolePermission } from './schema.js';
import { eq } from 'drizzle-orm';

const PERMISSIONS = [
  'users.read', 'users.write',
  'roles.read', 'roles.write',
  'products.read', 'products.write',
  'categories.read', 'categories.write',
  'stock.read', 'stock.write',
  'orders.read', 'orders.write',
  'analytics.read', 'logs.read',
  'coupons.write', 'payments.write', 'refunds.write',
];

const ROLES: Record<string, string[]> = {
  admin: PERMISSIONS,
  manager: ['products.read','products.write','categories.read','categories.write','stock.read','stock.write','orders.read','orders.write','analytics.read'],
  customer: ['products.read','categories.read','orders.read'],
};

for (const key of PERMISSIONS) {
  await db.insert(permission).values({ key }).onConflictDoNothing();
}

for (const [name, perms] of Object.entries(ROLES)) {
  const [r] = await db.insert(role).values({ name }).onConflictDoNothing().returning();
  const roleRow = r ?? (await db.select().from(role).where(eq(role.name, name)))[0];
  for (const key of perms) {
    const [p] = await db.select().from(permission).where(eq(permission.key, key));
    if (p) await db.insert(rolePermission).values({ roleId: roleRow.id, permissionId: p.id }).onConflictDoNothing();
  }
}

console.log('✓ seed complete');
process.exit(0);
