import { randomBytes } from 'crypto';
import { redis } from '../../config/redis.js';

const OTP_TTL_SECONDS = 15 * 60; // 15 minutes

function otpKey(type: 'email' | 'phone', identifier: string): string {
  return `otp:${type}:${identifier}`;
}

export async function generateOtp(
  type: 'email' | 'phone',
  identifier: string,
): Promise<string> {
  const token = randomBytes(32).toString('hex');
  await redis.set(otpKey(type, identifier), token, { ex: OTP_TTL_SECONDS });
  return token;
}

export async function verifyOtp(
  type: 'email' | 'phone',
  identifier: string,
  token: string,
): Promise<boolean> {
  const stored = await redis.get<string>(otpKey(type, identifier));
  if (!stored || stored !== token) return false;
  await redis.del(otpKey(type, identifier));
  return true;
}
