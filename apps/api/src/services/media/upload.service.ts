import { cloudinary, PRIVATE_FOLDER } from '../../config/cloudinary.js';
import { AppError } from '../../middleware/error.middleware.js';

export const MAX_PHOTOS = 6;
export const MIN_PHOTOS_REQUIRED = 3;

export const uploadService = {
  /**
   * Generate a signed upload parameters object for direct client-side Cloudinary upload.
   * Photos are stored in the private folder and require signed delivery URLs.
   */
  generateSignedUploadParams(userId: string): Record<string, string | number> {
    const timestamp = Math.round(Date.now() / 1000);
    const folder = `${PRIVATE_FOLDER}/${userId}`;
    const paramsToSign = {
      folder,
      timestamp,
      type: 'private',
    };

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
    await cloudinary.uploader.destroy(publicId, { type: 'private' });
  },
};
