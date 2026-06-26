import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import cookie from '@fastify/cookie';
import rateLimit from '@fastify/rate-limit';
import multipart from '@fastify/multipart';
import { env } from './env.js';
import { attachSession } from './middleware/auth.js';
import { authRoutes } from './modules/auth/routes.js';
import { userRoutes } from './modules/users/routes.js';
import { roleRoutes } from './modules/roles/routes.js';
import { categoryRoutes } from './modules/categories/routes.js';
import { productRoutes } from './modules/products/routes.js';
import { stockRoutes } from './modules/stock/routes.js';
import { orderRoutes } from './modules/orders/routes.js';

const app = Fastify({
  logger: env.NODE_ENV === 'development'
    ? { transport: { target: 'pino-pretty', options: { colorize: true } } }
    : true,
});

await app.register(helmet, { contentSecurityPolicy: false });
await app.register(cors, { origin: env.APP_URL, credentials: true });
await app.register(cookie);
await app.register(rateLimit, { max: 200, timeWindow: '1 minute' });
await app.register(multipart);

app.addHook('preHandler', attachSession);

app.get('/health', async () => ({ ok: true, env: env.NODE_ENV, time: new Date().toISOString() }));

await app.register(authRoutes);
await app.register(userRoutes);
await app.register(roleRoutes);
await app.register(categoryRoutes);
await app.register(productRoutes);
await app.register(stockRoutes);
await app.register(orderRoutes);

app.setErrorHandler((err, _req, reply) => {
  app.log.error(err);
  const status = (err as any).statusCode ?? 500;
  reply.status(status).send({ error: err.message ?? 'internal_error' });
});

await app.listen({ port: env.PORT, host: '0.0.0.0' });
