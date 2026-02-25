import { z } from 'zod';
import { MAX_PHOTOS } from '../services/media/upload.service.js';

export const confirmUploadSchema = z.object({
  publicId: z.string().min(1),
  order: z.number().int().min(1).max(MAX_PHOTOS),
});

export const reorderPhotosSchema = z.object({
  photos: z
    .array(
      z.object({
        publicId: z.string().min(1),
        order: z.number().int().min(1).max(MAX_PHOTOS),
      }),
    )
    .min(1)
    .max(MAX_PHOTOS),
});
