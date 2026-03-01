import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { env } from '../../config/env.js';

// Conditionally import cloudinary only when using cloudinary storage
let cloudinaryModule: typeof import('../../config/cloudinary.js') | null = null;
async function getCloudinary() {
  if (!cloudinaryModule) {
    cloudinaryModule = await import('../../config/cloudinary.js');
  }
  return cloudinaryModule;
}

export const MAX_PHOTOS = 6;
export const MIN_PHOTOS_REQUIRED = 3;

function randomId(): string {
  return crypto.randomBytes(16).toString('hex');
}

function extFromMime(mimeType: string): string {
  const map: Record<string, string> = {
    'image/jpeg': '.jpg',
    'image/jpg': '.jpg',
    'image/png': '.png',
    'image/webp': '.webp',
    'image/gif': '.gif',
  };
  return map[mimeType] ?? '.jpg';
}

export const uploadService = {
  /**
   * LOCAL: Save file buffer to disk, return publicId.
   * publicId format: "photos/{userId}/{uuid}.{ext}"
   */
  async uploadLocalFile(
    userId: string,
    buffer: Buffer,
    mimeType: string,
  ): Promise<{ publicId: string }> {
    const ext = extFromMime(mimeType);
    const filename = `${randomId()}${ext}`;
    const publicId = `photos/${userId}/${filename}`;
    const dir = path.join(env.UPLOADS_DIR, 'photos', userId);
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, filename), buffer);
    return { publicId };
  },

  /**
   * CLOUDINARY: Generate signed upload parameters for direct client-side upload.
   */
  async generateSignedUploadParams(userId: string): Promise<Record<string, string | number>> {
    const { cloudinary, PRIVATE_FOLDER } = await getCloudinary();
    const timestamp = Math.round(Date.now() / 1000);
    const folder = `${PRIVATE_FOLDER}/${userId}`;
    const paramsToSign = { folder, timestamp, type: 'private' };
    const signature = cloudinary.utils.api_sign_request(
      paramsToSign,
      cloudinary.config().api_secret as string,
    );
    return {
      signature,
      timestamp,
      folder,
      api_key: cloudinary.config().api_key as string,
      cloud_name: cloudinary.config().cloud_name as string,
    };
  },

  async deletePhoto(publicId: string): Promise<void> {
    if (env.STORAGE_TYPE === 'local') {
      // publicId = "photos/{userId}/{filename}"
      const filePath = path.join(env.UPLOADS_DIR, publicId);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      return;
    }
    const { cloudinary } = await getCloudinary();
    await cloudinary.uploader.destroy(publicId, { type: 'private' });
  },
};
