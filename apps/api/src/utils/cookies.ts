import type { Response } from 'express';
import { env } from '../config/env.js';
import type { UserRole } from '@kujuana/shared';

const REFRESH_COOKIE_NAME = 'refreshToken';
const REFRESH_COOKIE_MAX_AGE = 30 * 24 * 60 * 60 * 1000;
const ACCESS_COOKIE_NAMES = ['access_token', 'kujuana_access', 'kp_at'] as const;
const ROLE_COOKIE_NAMES = ['kujuana_role', 'role', 'user_role', 'kp_role'] as const;
const PROFILE_COMPLETE_COOKIE_NAMES = ['kp_pc', 'profile_completed'] as const;
const ACCESS_COOKIE_MAX_AGE = 15 * 60 * 1000;

function getRefreshCookieOptions() {
  return {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: 'strict' as const,
    maxAge: REFRESH_COOKIE_MAX_AGE,
  };
}

function getSessionCookieOptions() {
  return {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: 'strict' as const,
  };
}

export function setRefreshTokenCookie(res: Response, token: string): void {
  res.cookie(REFRESH_COOKIE_NAME, token, getRefreshCookieOptions());
}

export function clearRefreshTokenCookie(res: Response): void {
  res.clearCookie(REFRESH_COOKIE_NAME, getRefreshCookieOptions());
}

export function setAccessTokenCookies(res: Response, token: string): void {
  const options = {
    ...getSessionCookieOptions(),
    maxAge: ACCESS_COOKIE_MAX_AGE,
  };

  ACCESS_COOKIE_NAMES.forEach((name) => {
    res.cookie(name, token, options);
  });
}

export function clearAccessTokenCookies(res: Response): void {
  const options = getSessionCookieOptions();
  ACCESS_COOKIE_NAMES.forEach((name) => {
    res.clearCookie(name, options);
  });
}

export function setRoleCookies(
  res: Response,
  role: UserRole | 'user' | 'matchmaker' | 'manager' | 'admin',
): void {
  const options = {
    ...getSessionCookieOptions(),
    maxAge: REFRESH_COOKIE_MAX_AGE,
  };

  ROLE_COOKIE_NAMES.forEach((name) => {
    res.cookie(name, role, options);
  });
}

export function clearRoleCookies(res: Response): void {
  const options = getSessionCookieOptions();
  ROLE_COOKIE_NAMES.forEach((name) => {
    res.clearCookie(name, options);
  });
}

export function setProfileCompletionCookies(res: Response, completed: boolean): void {
  const options = {
    ...getSessionCookieOptions(),
    maxAge: REFRESH_COOKIE_MAX_AGE,
  };

  PROFILE_COMPLETE_COOKIE_NAMES.forEach((name) => {
    res.cookie(name, completed ? '1' : '0', options);
  });
}

export function clearProfileCompletionCookies(res: Response): void {
  const options = getSessionCookieOptions();
  PROFILE_COMPLETE_COOKIE_NAMES.forEach((name) => {
    res.clearCookie(name, options);
  });
}
