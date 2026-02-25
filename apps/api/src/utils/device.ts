import { createHash } from 'crypto';
import type { Request } from 'express';

const DEVICE_ID_PATTERN = /^[a-zA-Z0-9_.:-]{8,128}$/;

export function resolveDeviceId(req: Request): string {
  const header = req.headers['x-device-id'];
  const value = typeof header === 'string' ? header.trim() : '';
  if (value && DEVICE_ID_PATTERN.test(value)) {
    return value;
  }

  // Browser clients may not provide an explicit device id.
  const fingerprint = `${req.ip}:${req.headers['user-agent'] ?? 'unknown'}`;
  const digest = createHash('sha256').update(fingerprint).digest('hex').slice(0, 32);
  return `web-${digest}`;
}
