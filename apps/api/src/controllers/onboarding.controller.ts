import type { Request, Response, NextFunction } from 'express';
import { Profile } from '../models/Profile.model.js';
import { AppError } from '../middleware/error.middleware.js';

const STEP_KEYS = ['', 'plan', 'basic', 'background', 'photos', 'vision', 'preferences'];

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
      const step = parseInt(req.params['step'] ?? '0', 10);
      if (step < 1 || step > 6) return next(new AppError('Invalid step', 400));
      const key = STEP_KEYS[step];
      if (!key) return next(new AppError('Invalid step', 400));

      const profile = await Profile.findOneAndUpdate(
        { userId: req.user!.userId },
        { [key]: req.body },
        { new: true, upsert: true },
      );

      // Recalculate completeness
      const completeness = calculateCompleteness(profile);
      await Profile.findByIdAndUpdate(profile._id, { completeness });

      res.json({ message: 'Step saved', completeness });
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

      profile.isSubmitted = true;
      profile.submittedAt = new Date();
      await profile.save();

      res.json({ message: 'Profile submitted successfully' });
    } catch (err) {
      next(err);
    }
  },
};

function calculateCompleteness(profile: any) {
  const basic = Object.keys(profile.basic ?? {}).length >= 5;
  const background = Object.keys(profile.background ?? {}).length >= 5;
  const photos = (profile.photos ?? []).length >= 3;
  const vision = Object.keys(profile.vision ?? {}).length >= 5;
  const preferences = Object.keys(profile.preferences ?? {}).length >= 4;

  const sections = [basic, background, photos, vision, preferences];
  const overall = Math.round((sections.filter(Boolean).length / sections.length) * 100);

  return { basic, background, photos, vision, preferences, overall };
}
