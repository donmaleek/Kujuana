import crypto from 'crypto';
import { env } from '../../config/env.js';

const SIGNED_URL_TTL_SECONDS = 60 * 60; // 1 hour

function localSignedUrl(publicId: string, ttlSeconds = SIGNED_URL_TTL_SECONDS): string {
  // publicId = "photos/{userId}/{filename}"
  const exp = Math.round(Date.now() / 1000) + ttlSeconds;
  const secret = Buffer.from(env.ENCRYPTION_KEY, 'hex');
  const sig = crypto.createHmac('sha256', secret).update(`${publicId}:${exp}`).digest('hex');
  // Strip leading "photos/" for the URL path
  const urlPath = publicId.replace(/^photos\//, '');
  return `${env.API_BASE_URL}/api/v1/upload/serve/${urlPath}?exp=${exp}&sig=${sig}`;
}

export function verifyLocalSignedToken(
  publicId: string,
  exp: string,
  sig: string,
): boolean {
  const expNum = Number(exp);
  if (isNaN(expNum) || Date.now() / 1000 > expNum) return false;
  const secret = Buffer.from(env.ENCRYPTION_KEY, 'hex');
  const expected = crypto
    .createHmac('sha256', secret)
    .update(`${publicId}:${exp}`)
    .digest('hex');
  return crypto.timingSafeEqual(Buffer.from(sig, 'hex'), Buffer.from(expected, 'hex'));
}

export const signedUrlService = {
  generate(publicId: string, options: { width?: number; height?: number } = {}): string {
    if (env.STORAGE_TYPE === 'local') {
      return localSignedUrl(publicId);
    }
    // Cloudinary path
    const cloudinary = require('cloudinary').v2;
    return cloudinary.url(publicId, {
      type: 'private',
      sign_url: true,
      expires_at: Math.round(Date.now() / 1000) + SIGNED_URL_TTL_SECONDS,
      ...options,
    });
  },

  generateThumbnail(publicId: string): string {
    return this.generate(publicId, { width: 400, height: 400 });
  },
};
