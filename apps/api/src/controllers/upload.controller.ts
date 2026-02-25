import type { Request, Response, NextFunction } from 'express';
import { uploadService } from '../services/media/upload.service.js';
import { Profile } from '../models/Profile.model.js';
import { AppError } from '../middleware/error.middleware.js';

export const uploadController = {
  async getSignedParams(req: Request, res: Response, next: NextFunction) {
    try {
      const params = uploadService.generateSignedUploadParams(req.user!.userId);
      res.json(params);
    } catch (err) {
      next(err);
    }
  },

  async confirmUpload(req: Request, res: Response, next: NextFunction) {
    try {
      const { publicId, order } = req.body as { publicId: string; order: number };
      await Profile.findOneAndUpdate(
        { userId: req.user!.userId },
        {
          $push: { photos: { publicId, isPrivate: true, order } },
        },
      );
      res.json({ message: 'Photo added' });
    } catch (err) {
      next(err);
    }
  },

  async deletePhoto(req: Request, res: Response, next: NextFunction) {
    try {
      const { publicId } = req.params as { publicId: string };
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
      const profile = await Profile.findOne({ userId: req.user!.userId });
      if (!profile) return next(new AppError('Profile not found', 404));

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
