import type { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../services/auth/jwt.service.js';
import { AppError } from './error.middleware.js';

const ACCESS_COOKIE_CANDIDATES = ['access_token', 'kujuana_access', 'kp_at'] as const;

function resolveAccessToken(req: Request): string | null {
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.slice(7);
  }

  for (const cookieName of ACCESS_COOKIE_CANDIDATES) {
    const token = req.cookies?.[cookieName];
    if (typeof token === 'string' && token.trim().length > 0) {
      return token;
    }
  }

  return null;
}

export async function authenticate(req: Request, _res: Response, next: NextFunction) {
  const token = resolveAccessToken(req);
  if (!token) {
    return next(new AppError('Missing or invalid authorization token', 401));
  }

  try {
    const payload = verifyAccessToken(token);
    req.user = payload;
    next();
  } catch {
    next(new AppError('Invalid or expired access token', 401));
  }
}
