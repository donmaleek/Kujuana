import { randomBytes } from 'crypto';
import { redis } from '../../config/redis.js';
import { safeCompare } from '../../utils/security.js';
import { env } from '../../config/env.js';
import { logger } from '../../config/logger.js';

const OTP_TTL_SECONDS = 15 * 60; // 15 minutes
const OTP_REDIS_TIMEOUT_MS = 400;
const OTP_MEMORY_SWEEP_INTERVAL = 60_000;
// Memory fallback is safe for single-instance servers; always enabled so OTP
// works even when Upstash Redis is not configured (local server).
const isNonProd = true;
const memoryOtpStore = new Map<string, { token: string; expiresAt: number }>();
let lastMemorySweepAt = 0;

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

function sweepExpiredMemoryOtps(now = Date.now()): void {
  if (now - lastMemorySweepAt < OTP_MEMORY_SWEEP_INTERVAL) return;
  lastMemorySweepAt = now;

  for (const [key, value] of memoryOtpStore.entries()) {
    if (value.expiresAt <= now) {
      memoryOtpStore.delete(key);
    }
  }
}

function setMemoryOtp(type: 'email' | 'phone', identifier: string, token: string): void {
  const now = Date.now();
  sweepExpiredMemoryOtps(now);
  memoryOtpStore.set(otpKey(type, identifier), {
    token,
    expiresAt: now + OTP_TTL_SECONDS * 1000,
  });
}

function getMemoryOtp(type: 'email' | 'phone', identifier: string): string | null {
  const now = Date.now();
  sweepExpiredMemoryOtps(now);
  const record = memoryOtpStore.get(otpKey(type, identifier));
  if (!record) return null;
  if (record.expiresAt <= now) {
    memoryOtpStore.delete(otpKey(type, identifier));
    return null;
  }
  return record.token;
}

function deleteMemoryOtp(type: 'email' | 'phone', identifier: string): void {
  memoryOtpStore.delete(otpKey(type, identifier));
}

export async function generateOtp(
  type: 'email' | 'phone',
  identifier: string,
): Promise<string> {
  const token = randomBytes(32).toString('hex');
  try {
    await withTimeout(redis.set(otpKey(type, identifier), token, { ex: OTP_TTL_SECONDS }), OTP_REDIS_TIMEOUT_MS);
  } catch (err) {
    if (!isNonProd) throw err;
    setMemoryOtp(type, identifier, token);
    logger.warn({ err, type, identifier }, 'Redis unavailable for OTP set; using in-memory OTP fallback');
  }
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
  } catch (err) {
    if (!isNonProd) return false;
    stored = getMemoryOtp(type, identifier);
    logger.warn({ err, type, identifier }, 'Redis unavailable for OTP get; using in-memory OTP fallback');
  }

  if (!stored || !safeCompare(stored, token)) return false;
  try {
    await withTimeout(redis.del(otpKey(type, identifier)), OTP_REDIS_TIMEOUT_MS);
  } catch (err) {
    if (isNonProd) {
      deleteMemoryOtp(type, identifier);
      logger.warn({ err, type, identifier }, 'Redis unavailable for OTP delete; removed in-memory OTP fallback entry');
      return true;
    }
    // Non-fatal; token TTL still clears eventually.
  }
  if (isNonProd) deleteMemoryOtp(type, identifier);
  return true;
}
