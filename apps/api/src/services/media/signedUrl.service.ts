import { cloudinary } from '../../config/cloudinary.js';

const SIGNED_URL_TTL_SECONDS = 60 * 60; // 1 hour

export const signedUrlService = {
  /**
   * Generate a time-limited signed delivery URL for a private Cloudinary asset.
   */
  generate(publicId: string, options: { width?: number; height?: number } = {}): string {
    const url = cloudinary.url(publicId, {
      type: 'private',
      sign_url: true,
      expires_at: Math.round(Date.now() / 1000) + SIGNED_URL_TTL_SECONDS,
      ...options,
    });
    return url;
  },

  generateThumbnail(publicId: string): string {
    return this.generate(publicId, { width: 400, height: 400 });
  },
};
