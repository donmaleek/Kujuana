import type { Request, Response, NextFunction } from 'express';
import { AppError } from './error.middleware.js';
import { rotateRefreshToken } from '../services/auth/jwt.service.js';
import { setRefreshTokenCookie } from '../utils/cookies.js';
import { resolveDeviceId } from '../utils/device.js';

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
    const deviceId = resolveDeviceId(req);
    const { accessToken, newRefreshToken } = await rotateRefreshToken(
      refreshToken,
      deviceId,
    );

    setRefreshTokenCookie(res, newRefreshToken);

    res.json({ accessToken });
  } catch (err) {
    next(err);
  }
}
