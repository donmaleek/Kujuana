import { randomBytes } from 'crypto';
import { redis } from '../../config/redis.js';
import { safeCompare } from '../../utils/security.js';

const OTP_TTL_SECONDS = 15 * 60; // 15 minutes
const OTP_REDIS_TIMEOUT_MS = 400;

function otpKey(type: 'email' | 'phone', identifier: string): string {
  return `otp:${type}:${identifier}`;
}

function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error(`OTP Redis timed out after ${timeoutMs}ms`));
    }, timeoutMs);

    promise
      .then((value) => {
        clearTimeout(timeout);
        resolve(value);
      })
      .catch((error: unknown) => {
        clearTimeout(timeout);
        reject(error);
      });
  });
}

export async function generateOtp(
  type: 'email' | 'phone',
  identifier: string,
): Promise<string> {
  const token = randomBytes(32).toString('hex');
  await withTimeout(redis.set(otpKey(type, identifier), token, { ex: OTP_TTL_SECONDS }), OTP_REDIS_TIMEOUT_MS);
  return token;
}

export async function verifyOtp(
  type: 'email' | 'phone',
  identifier: string,
  token: string,
): Promise<boolean> {
  let stored: string | null;
  try {
    stored = await withTimeout(redis.get<string>(otpKey(type, identifier)), OTP_REDIS_TIMEOUT_MS);
  } catch {
    return false;
  }

  if (!stored || !safeCompare(stored, token)) return false;
  try {
    await withTimeout(redis.del(otpKey(type, identifier)), OTP_REDIS_TIMEOUT_MS);
  } catch {
    // Non-fatal; token TTL still clears eventually.
  }
  return true;
}
