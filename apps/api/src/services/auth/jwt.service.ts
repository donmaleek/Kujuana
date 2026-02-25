import jwt from 'jsonwebtoken';
import { env } from '../../config/env.js';
import type { UserRole } from '@kujuana/shared';
import { DeviceSession } from '../../models/DeviceSession.model.js';
import { timingSafeEqual, createHash } from 'crypto';
import { AppError } from '../../middleware/error.middleware.js';

export interface JwtPayload {
  userId: string;
  email: string;
  roles: UserRole[];
}

export function signAccessToken(payload: JwtPayload): string {
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, {
    expiresIn: env.JWT_ACCESS_EXPIRES_IN,
  } as jwt.SignOptions);
}

export function signRefreshToken(payload: JwtPayload): string {
  return jwt.sign(payload, env.JWT_REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRES_IN,
  } as jwt.SignOptions);
}

export function verifyAccessToken(token: string): JwtPayload {
  return jwt.verify(token, env.JWT_ACCESS_SECRET) as JwtPayload;
}

export function verifyRefreshToken(token: string): JwtPayload {
  return jwt.verify(token, env.JWT_REFRESH_SECRET) as JwtPayload;
}

function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

export async function rotateRefreshToken(
  oldToken: string,
  deviceId: string,
): Promise<{ accessToken: string; newRefreshToken: string }> {
  if (!deviceId) {
    throw new AppError('Missing device identifier', 401);
  }

  let payload: JwtPayload;
  try {
    payload = verifyRefreshToken(oldToken);
  } catch {
    throw new AppError('Invalid refresh token', 401);
  }

  const tokenHash = hashToken(oldToken);
  const session = await DeviceSession.findOne({
    userId: payload.userId,
    deviceId,
    isRevoked: false,
  });

  if (!session) throw new AppError('Session not found', 401);
  if (session.expiresAt.getTime() <= Date.now()) {
    session.isRevoked = true;
    await session.save();
    throw new AppError('Session expired', 401);
  }

  const storedHash = Buffer.from(session.refreshTokenHash);
  const incomingHash = Buffer.from(tokenHash);
  if (
    storedHash.length !== incomingHash.length ||
    !timingSafeEqual(storedHash, incomingHash)
  ) {
    // Token reuse – revoke all sessions
    await DeviceSession.updateMany({ userId: payload.userId }, { isRevoked: true });
    throw new AppError('Token reuse detected', 401);
  }

  const newRefreshToken = signRefreshToken({
    userId: payload.userId,
    email: payload.email,
    roles: payload.roles,
  });

  session.refreshTokenHash = hashToken(newRefreshToken);
  session.lastUsedAt = new Date();
  await session.save();

  const accessToken = signAccessToken({
    userId: payload.userId,
    email: payload.email,
    roles: payload.roles,
  });

  return { accessToken, newRefreshToken };
}
