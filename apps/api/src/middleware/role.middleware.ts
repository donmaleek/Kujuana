import type { Request, Response, NextFunction } from 'express';
import type { UserRole } from '@kujuana/shared';
import { AppError } from './error.middleware.js';

export function requireRole(...roles: UserRole[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) return next(new AppError('Unauthorized', 401));
    const hasRole = req.user.roles.some((r) => roles.includes(r as UserRole));
    if (!hasRole) {
      return next(new AppError('Insufficient permissions', 403));
    }
    next();
  };
}
