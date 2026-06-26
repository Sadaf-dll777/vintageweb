import type { FastifyInstance } from 'fastify';
import { auth } from '../../lib/auth.js';

export async function authRoutes(app: FastifyInstance) {
  // Mount Better Auth's web handler at /api/auth/*
  app.all('/api/auth/*', async (req, reply) => {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const request = new Request(url, {
      method: req.method,
      headers: req.headers as any,
      body: ['GET','HEAD'].includes(req.method) ? undefined : JSON.stringify(req.body),
    });
    const response = await auth.handler(request);
    reply.status(response.status);
    response.headers.forEach((v, k) => reply.header(k, v));
    reply.send(response.body ? await response.text() : null);
  });

  app.get('/api/me', async (req, reply) => {
    if (!req.user) return reply.code(401).send({ error: 'unauthorized' });
    return { user: req.user };
  });
}
