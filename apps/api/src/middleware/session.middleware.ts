import type { Request, Response, NextFunction } from 'express';
import { AppError } from './error.middleware.js';
import { rotateRefreshToken } from '../services/auth/jwt.service.js';

/**
 * Handles refresh token rotation via httpOnly cookie.
 * Used on the POST /auth/refresh endpoint.
 */
export async function sessionRefresh(req: Request, res: Response, next: NextFunction) {
  const refreshToken = req.cookies?.refreshToken as string | undefined;
  if (!refreshToken) {
    return next(new AppError('No refresh token', 401));
  }

  try {
    const { accessToken, newRefreshToken } = await rotateRefreshToken(
      refreshToken,
      req.headers['x-device-id'] as string,
    );

    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: process.env['NODE_ENV'] === 'production',
      sameSite: 'strict',
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    res.json({ accessToken });
  } catch (err) {
    next(err);
  }
}
