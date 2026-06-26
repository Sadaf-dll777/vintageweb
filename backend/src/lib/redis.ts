import Redis from 'ioredis';
import { env } from '../env.js';

export const redis = new Redis(env.REDIS_URL, { lazyConnect: true, maxRetriesPerRequest: 2 });

redis.on('error', (e) => console.warn('[redis]', e.message));

export async function cacheGet<T>(key: string): Promise<T | null> {
  try { const v = await redis.get(key); return v ? JSON.parse(v) as T : null; } catch { return null; }
}
export async function cacheSet(key: string, value: unknown, ttlSeconds = 60) {
  try { await redis.set(key, JSON.stringify(value), 'EX', ttlSeconds); } catch {}
}
export async function cacheDel(pattern: string) {
  try {
    const keys = await redis.keys(pattern);
    if (keys.length) await redis.del(...keys);
  } catch {}
}
