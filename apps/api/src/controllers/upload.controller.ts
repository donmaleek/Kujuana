import path from 'path';
import fs from 'fs';
import type { Request, Response, NextFunction } from 'express';
import { uploadService, MAX_PHOTOS } from '../services/media/upload.service.js';
import { verifyLocalSignedToken } from '../services/media/signedUrl.service.js';
import { Profile } from '../models/Profile.model.js';
import { AppError } from '../middleware/error.middleware.js';
import { env } from '../config/env.js';

function isPhotoOwnedByUser(userId: string, publicId: string): boolean {
  if (env.STORAGE_TYPE === 'local') {
    return publicId.startsWith(`photos/${userId}/`);
  }
  const PRIVATE_FOLDER = env.CLOUDINARY_PRIVATE_FOLDER;
  return publicId.startsWith(`${PRIVATE_FOLDER}/${userId}/`);
}

export const uploadController = {
  async getSignedParams(req: Request, res: Response, next: NextFunction) {
    try {
      if (env.STORAGE_TYPE === 'local') {
        const profile = await Profile.findOne({ userId: req.user!.userId }).select('photos');
        if (profile && profile.photos.length >= MAX_PHOTOS) {
          return next(new AppError(`Maximum of ${MAX_PHOTOS} photos allowed`, 400));
        }
        return res.json({ storageType: 'local', uploadUrl: `/api/v1/uploads/file` });
      }
      const profile = await Profile.findOne({ userId: req.user!.userId }).select('photos');
      if (profile && profile.photos.length >= MAX_PHOTOS) {
        return next(new AppError(`Maximum of ${MAX_PHOTOS} photos allowed`, 400));
      }
      const params = await uploadService.generateSignedUploadParams(req.user!.userId);
      res.json(params);
    } catch (err) {
      next(err);
    }
  },

  /**
   * POST /uploads/file — multer multipart upload for local storage mode.
   * Receives a file, saves to disk, confirms photo in profile, returns publicId.
   */
  async receiveFile(req: Request, res: Response, next: NextFunction) {
    try {
      const file = (req as any).file as Express.Multer.File | undefined;
      if (!file) return next(new AppError('No file uploaded', 400));

      const { order } = req.body as { order?: string };
      const orderNum = order ? Number(order) : undefined;

      const { publicId } = await uploadService.uploadLocalFile(
        req.user!.userId,
        file.buffer,
        file.mimetype,
      );

      const updated = await Profile.findOneAndUpdate(
        {
          userId: req.user!.userId,
          'photos.publicId': { $ne: publicId },
          $expr: { $lt: [{ $size: '$photos' }, MAX_PHOTOS] },
        },
        { $push: { photos: { publicId, isPrivate: true, order: orderNum } } },
        { new: true },
      );

      if (!updated) {
        const filePath = path.join(env.UPLOADS_DIR, publicId);
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        return next(new AppError(`Maximum of ${MAX_PHOTOS} photos allowed`, 400));
      }

      res.json({ publicId });
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
      const publicId = decodeURIComponent(req.params.publicId as string);
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

  /**
   * GET /uploads/serve/:userId/:filename — serve a locally stored photo.
   * Validates HMAC-signed token before streaming. No auth middleware needed.
   */
  async servePhoto(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId, filename } = req.params as { userId: string; filename: string };
      const { exp, sig } = req.query as { exp?: string; sig?: string };

      if (!exp || !sig) return res.status(401).json({ error: 'Missing token' });

      const publicId = `photos/${userId}/${filename}`;

      if (!verifyLocalSignedToken(publicId, exp, sig)) {
        return res.status(401).json({ error: 'Invalid or expired URL' });
      }

      const filePath = path.join(env.UPLOADS_DIR, 'photos', userId, filename);
      if (!fs.existsSync(filePath)) return res.status(404).json({ error: 'Not found' });

      const ext = path.extname(filename).toLowerCase();
      const mimeTypes: Record<string, string> = {
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.png': 'image/png',
        '.webp': 'image/webp',
        '.gif': 'image/gif',
      };
      res.setHeader('Content-Type', mimeTypes[ext] ?? 'image/jpeg');
      res.setHeader('Cache-Control', 'private, max-age=3600');
      fs.createReadStream(filePath).pipe(res);
    } catch (err) {
      next(err);
    }
  },
};
