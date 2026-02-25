import type { Request, Response, NextFunction } from 'express';
import { redis } from '../config/redis.js';
import { AppError } from './error.middleware.js';

const WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS = 100;

export async function rateLimitMiddleware(req: Request, _res: Response, next: NextFunction) {
  const key = `rate:${req.ip}`;
  const now = Date.now();
  const windowStart = now - WINDOW_MS;

  try {
    // Sliding window using Upstash Redis sorted set
    await redis.zremrangebyscore(key, 0, windowStart);
    const count = await redis.zcard(key);

    if (count >= MAX_REQUESTS) {
      return next(new AppError('Too many requests', 429, 'RATE_LIMITED'));
    }

    await redis.zadd(key, { score: now, member: `${now}-${Math.random()}` });
    await redis.expire(key, 120);

    next();
  } catch {
    // If Redis is unavailable, fail open
    next();
  }
}
