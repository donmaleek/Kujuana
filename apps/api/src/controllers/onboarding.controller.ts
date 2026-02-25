import type { Request, Response, NextFunction } from 'express';
import { Profile } from '../models/Profile.model.js';
import { AppError } from '../middleware/error.middleware.js';
import {
  step1PlanSchema,
  step2BasicSchema,
  step3BackgroundSchema,
  step5VisionSchema,
  step6PreferencesSchema,
} from '@kujuana/shared';
import { z } from 'zod';

const step4PhotosSchema = z
  .union([
    z.array(
      z.object({
        publicId: z.string().min(1),
        order: z.number().int().min(1),
        isPrivate: z.boolean().optional(),
      }),
    ),
    z.object({
      photos: z.array(
        z.object({
          publicId: z.string().min(1),
          order: z.number().int().min(1),
          isPrivate: z.boolean().optional(),
        }),
      ),
    }),
  ])
  .transform((value) => (Array.isArray(value) ? value : value.photos));

const STEP_CONFIG = {
  1: { key: 'plan', schema: step1PlanSchema },
  2: { key: 'basic', schema: step2BasicSchema },
  3: { key: 'background', schema: step3BackgroundSchema },
  4: { key: 'photos', schema: step4PhotosSchema },
  5: { key: 'vision', schema: step5VisionSchema },
  6: { key: 'preferences', schema: step6PreferencesSchema },
} as const;

export const onboardingController = {
  async getProgress(req: Request, res: Response, next: NextFunction) {
    try {
      const profile = await Profile.findOne({ userId: req.user!.userId });
      res.json({ completeness: profile?.completeness ?? { overall: 0 } });
    } catch (err) {
      next(err);
    }
  },

  async saveStep(req: Request, res: Response, next: NextFunction) {
    try {
      const stepParam = req.params['step'];
      const stepValue = Array.isArray(stepParam) ? stepParam[0] : stepParam;
      const step = parseInt(stepValue ?? '0', 10);
      const stepConfig = STEP_CONFIG[step as keyof typeof STEP_CONFIG];
      if (!stepConfig) return next(new AppError('Invalid step', 400));

      const parsed = stepConfig.schema.safeParse(req.body);
      if (!parsed.success) {
        return next(parsed.error);
      }

      let profile = await Profile.findOne({ userId: req.user!.userId });
      if (!profile) {
        profile = await Profile.create({ userId: req.user!.userId });
      }

      if (stepConfig.key === 'photos') {
        const stepPhotos = parsed.data as Array<{
          publicId: string;
          order: number;
          isPrivate?: boolean;
        }>;

        const photos = stepPhotos
          .map((p) => ({
            publicId: p.publicId,
            order: p.order,
            isPrivate: p.isPrivate ?? true,
            isPrimary: false,
          }))
          .sort((a, b) => a.order - b.order)
          .map((p, i) => ({ ...p, isPrimary: i === 0 }));
        profile.photos = photos as any;
      } else {
        (profile as any)[stepConfig.key] = parsed.data;
      }

      profile.onboardingStep = Math.max(profile.onboardingStep ?? 1, step);
      await profile.save();

      res.json({ message: 'Step saved', completeness: profile.completeness });
    } catch (err) {
      next(err);
    }
  },

  async submit(req: Request, res: Response, next: NextFunction) {
    try {
      const profile = await Profile.findOne({ userId: req.user!.userId });
      if (!profile) return next(new AppError('Profile not found', 404));
      if (profile.completeness.overall < 100) {
        return next(new AppError('Profile is not complete', 400));
      }

      profile.onboardingComplete = true;
      profile.isActive = true;
      profile.isSubmitted = true;
      profile.submittedAt = new Date();
      await profile.save();

      res.json({ message: 'Profile submitted successfully' });
    } catch (err) {
      next(err);
    }
  },
};
