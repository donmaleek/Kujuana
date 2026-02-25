import type { Request, Response, NextFunction } from 'express';
import { uploadService, MAX_PHOTOS } from '../services/media/upload.service.js';
import { Profile } from '../models/Profile.model.js';
import { AppError } from '../middleware/error.middleware.js';
import { PRIVATE_FOLDER } from '../config/cloudinary.js';

function isPhotoOwnedByUser(userId: string, publicId: string): boolean {
  return publicId.startsWith(`${PRIVATE_FOLDER}/${userId}/`);
}

export const uploadController = {
  async getSignedParams(req: Request, res: Response, next: NextFunction) {
    try {
      const profile = await Profile.findOne({ userId: req.user!.userId }).select('photos');
      if (profile && profile.photos.length >= MAX_PHOTOS) {
        return next(new AppError(`Maximum of ${MAX_PHOTOS} photos allowed`, 400));
      }

      const params = uploadService.generateSignedUploadParams(req.user!.userId);
      res.json(params);
    } catch (err) {
      next(err);
    }
  },

  async confirmUpload(req: Request, res: Response, next: NextFunction) {
    try {
      const { publicId, order } = req.body as { publicId: string; order: number };
      if (!isPhotoOwnedByUser(req.user!.userId, publicId)) {
        return next(new AppError('Invalid photo reference', 400));
      }

      // Atomic: only insert if the photo isn't already present AND the count is below the limit.
      const updated = await Profile.findOneAndUpdate(
        {
          userId: req.user!.userId,
          'photos.publicId': { $ne: publicId },
          $expr: { $lt: [{ $size: '$photos' }, MAX_PHOTOS] },
        },
        { $push: { photos: { publicId, isPrivate: true, order } } },
        { new: true },
      );

      if (!updated) {
        // Determine exact failure reason for a helpful error message.
        const profile = await Profile.findOne({ userId: req.user!.userId }).select('photos');
        if (!profile) return next(new AppError('Profile not found', 404));
        if (profile.photos.some((p) => p.publicId === publicId)) {
          return next(new AppError('Photo already added', 409));
        }
        return next(new AppError(`Maximum of ${MAX_PHOTOS} photos allowed`, 400));
      }

      res.json({ message: 'Photo added' });
    } catch (err) {
      next(err);
    }
  },

  async deletePhoto(req: Request, res: Response, next: NextFunction) {
    try {
      const { publicId } = req.params as { publicId: string };
      if (!isPhotoOwnedByUser(req.user!.userId, publicId)) {
        return next(new AppError('Invalid photo reference', 400));
      }

      const profile = await Profile.findOne({ userId: req.user!.userId });
      if (!profile) return next(new AppError('Profile not found', 404));
      if (!profile.photos.some((photo) => photo.publicId === publicId)) {
        return next(new AppError('Photo not found', 404));
      }

      await uploadService.deletePhoto(publicId);
      await Profile.findOneAndUpdate(
        { userId: req.user!.userId },
        { $pull: { photos: { publicId } } },
      );
      res.json({ message: 'Photo deleted' });
    } catch (err) {
      next(err);
    }
  },

  async reorderPhotos(req: Request, res: Response, next: NextFunction) {
    try {
      const { photos } = req.body as { photos: Array<{ publicId: string; order: number }> };
      const uniquePhotoIds = new Set(photos.map((photo) => photo.publicId));
      if (uniquePhotoIds.size !== photos.length) {
        return next(new AppError('Duplicate photo IDs in reorder payload', 400));
      }

      const profile = await Profile.findOne({ userId: req.user!.userId });
      if (!profile) return next(new AppError('Profile not found', 404));

      for (const photoRef of photos) {
        if (!profile.photos.some((photo) => photo.publicId === photoRef.publicId)) {
          return next(new AppError(`Photo not found: ${photoRef.publicId}`, 400));
        }
      }

      photos.forEach(({ publicId, order }) => {
        const photo = profile.photos.find((p) => p.publicId === publicId);
        if (photo) photo.order = order;
      });

      await profile.save();
      res.json({ message: 'Photos reordered' });
    } catch (err) {
      next(err);
    }
  },
};
