import type { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../services/auth/jwt.service.js';
import { AppError } from './error.middleware.js';

export async function authenticate(req: Request, _res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return next(new AppError('Missing or invalid authorization header', 401));
  }

  const token = authHeader.slice(7);
  try {
    const payload = verifyAccessToken(token);
    req.user = payload;
    next();
  } catch {
    next(new AppError('Invalid or expired access token', 401));
  }
}
