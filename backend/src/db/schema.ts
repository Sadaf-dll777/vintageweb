import { pgTable, text, timestamp, integer, boolean, pgEnum, uuid, jsonb, primaryKey, index } from 'drizzle-orm/pg-core';

// ---------- Better Auth tables ----------
export const user = pgTable('user', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('email_verified').notNull().default(false),
  image: text('image'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const session = pgTable('session', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  token: text('token').notNull().unique(),
  expiresAt: timestamp('expires_at').notNull(),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const account = pgTable('account', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  accountId: text('account_id').notNull(),
  providerId: text('provider_id').notNull(),
  accessToken: text('access_token'),
  refreshToken: text('refresh_token'),
  idToken: text('id_token'),
  accessTokenExpiresAt: timestamp('access_token_expires_at'),
  refreshTokenExpiresAt: timestamp('refresh_token_expires_at'),
  scope: text('scope'),
  password: text('password'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const verification = pgTable('verification', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// ---------- Roles & Permissions ----------
export const role = pgTable('role', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull().unique(), // admin | manager | customer
  description: text('description'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const permission = pgTable('permission', {
  id: uuid('id').primaryKey().defaultRandom(),
  key: text('key').notNull().unique(), // e.g. products.create
  description: text('description'),
});

export const rolePermission = pgTable('role_permission', {
  roleId: uuid('role_id').notNull().references(() => role.id, { onDelete: 'cascade' }),
  permissionId: uuid('permission_id').notNull().references(() => permission.id, { onDelete: 'cascade' }),
}, (t) => ({ pk: primaryKey({ columns: [t.roleId, t.permissionId] }) }));

export const userRole = pgTable('user_role', {
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  roleId: uuid('role_id').notNull().references(() => role.id, { onDelete: 'cascade' }),
}, (t) => ({ pk: primaryKey({ columns: [t.userId, t.roleId] }) }));

// ---------- Catalog ----------
export const category = pgTable('category', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  parentId: uuid('parent_id'),
  description: text('description'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const product = pgTable('product', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  description: text('description'),
  priceCents: integer('price_cents').notNull(), // stored in minor units
  currency: text('currency').notNull().default('BDT'),
  categoryId: uuid('category_id').references(() => category.id, { onDelete: 'set null' }),
  images: jsonb('images').$type<string[]>().notNull().default([]),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (t) => ({ catIdx: index('product_category_idx').on(t.categoryId) }));

// ---------- Stock ----------
export const stockMovementType = pgEnum('stock_movement_type', ['restock', 'sale', 'adjustment', 'return']);

export const stock = pgTable('stock', {
  productId: uuid('product_id').primaryKey().references(() => product.id, { onDelete: 'cascade' }),
  quantity: integer('quantity').notNull().default(0),
  lowStockThreshold: integer('low_stock_threshold').notNull().default(5),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const stockMovement = pgTable('stock_movement', {
  id: uuid('id').primaryKey().defaultRandom(),
  productId: uuid('product_id').notNull().references(() => product.id, { onDelete: 'cascade' }),
  type: stockMovementType('type').notNull(),
  delta: integer('delta').notNull(),
  reason: text('reason'),
  createdBy: text('created_by').references(() => user.id, { onDelete: 'set null' }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// ---------- Orders ----------
export const orderStatus = pgEnum('order_status', ['pending', 'paid', 'shipped', 'delivered', 'cancelled', 'refunded']);

export const order = pgTable('order', {
  id: uuid('id').primaryKey().defaultRandom(),
  orderNumber: text('order_number').notNull().unique(),
  userId: text('user_id').references(() => user.id, { onDelete: 'set null' }),
  status: orderStatus('status').notNull().default('pending'),
  subtotalCents: integer('subtotal_cents').notNull(),
  shippingCents: integer('shipping_cents').notNull().default(0),
  taxCents: integer('tax_cents').notNull().default(0),
  discountCents: integer('discount_cents').notNull().default(0),
  totalCents: integer('total_cents').notNull(),
  currency: text('currency').notNull().default('BDT'),
  shippingAddress: jsonb('shipping_address').$type<Record<string, unknown>>(),
  billingAddress: jsonb('billing_address').$type<Record<string, unknown>>(),
  notes: text('notes'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const orderItem = pgTable('order_item', {
  id: uuid('id').primaryKey().defaultRandom(),
  orderId: uuid('order_id').notNull().references(() => order.id, { onDelete: 'cascade' }),
  productId: uuid('product_id').references(() => product.id, { onDelete: 'set null' }),
  productName: text('product_name').notNull(),
  unitPriceCents: integer('unit_price_cents').notNull(),
  quantity: integer('quantity').notNull(),
  totalCents: integer('total_cents').notNull(),
});
