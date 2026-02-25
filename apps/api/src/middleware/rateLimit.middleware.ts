import type { Request, Response, NextFunction } from 'express';
import { redis } from '../config/redis.js';
import { AppError } from './error.middleware.js';
import { logger } from '../config/logger.js';

interface RateLimitOptions {
  keyPrefix: string;
  windowMs: number;
  maxRequests: number;
  keyGenerator?: (req: Request) => string;
  failOpen?: boolean;
}

function getClientIp(req: Request): string {
  if (req.ip) return req.ip;
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string') {
    return forwarded.split(',')[0]?.trim() ?? 'unknown';
  }
  return req.socket.remoteAddress ?? 'unknown';
}

function normalizeKeyPart(part: string): string {
  return part.toLowerCase().replace(/[^a-z0-9:_.-]/g, '').slice(0, 120) || 'unknown';
}

function createRateLimitMiddleware(options: RateLimitOptions) {
  const failOpen = options.failOpen ?? true;

  return async function rateLimitMiddleware(req: Request, res: Response, next: NextFunction) {
    const identity = options.keyGenerator ? options.keyGenerator(req) : getClientIp(req);
    const key = `rate:${options.keyPrefix}:${normalizeKeyPart(identity)}`;
    const now = Date.now();
    const windowStart = now - options.windowMs;

    try {
      // Sliding window using Upstash Redis sorted set.
      await redis.zremrangebyscore(key, 0, windowStart);
      const count = await redis.zcard(key);

      const resetSeconds = Math.ceil((now + options.windowMs) / 1000);
      res.setHeader('X-RateLimit-Limit', options.maxRequests.toString());
      res.setHeader('X-RateLimit-Reset', resetSeconds.toString());

      if (count >= options.maxRequests) {
        res.setHeader('X-RateLimit-Remaining', '0');
        res.setHeader('Retry-After', Math.ceil(options.windowMs / 1000).toString());
        return next(new AppError('Too many requests', 429, 'RATE_LIMITED'));
      }

      await redis.zadd(key, { score: now, member: `${now}-${Math.random()}` });
      await redis.expire(key, Math.ceil(options.windowMs / 1000) + 60);

      const remaining = Math.max(0, options.maxRequests - (count + 1));
      res.setHeader('X-RateLimit-Remaining', remaining.toString());
      return next();
    } catch (err) {
      logger.warn({ err, keyPrefix: options.keyPrefix }, 'Rate limiter unavailable');
      if (failOpen) return next();
      return next(new AppError('Rate limiting unavailable', 503, 'RATE_LIMIT_UNAVAILABLE'));
    }
  };
}

export const rateLimitMiddleware = createRateLimitMiddleware({
  keyPrefix: 'global',
  windowMs: 60 * 1000,
  maxRequests: 100,
});

export const authRateLimitMiddleware = createRateLimitMiddleware({
  keyPrefix: 'auth',
  windowMs: 15 * 60 * 1000,
  maxRequests: 20,
  keyGenerator: (req) => {
    const email =
      typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : 'anonymous';
    return `${getClientIp(req)}:${email}`;
  },
});
