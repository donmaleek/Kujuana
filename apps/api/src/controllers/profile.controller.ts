import type { Request, Response, NextFunction } from 'express';
import { Profile } from '../models/Profile.model.js';
import { AppError } from '../middleware/error.middleware.js';

export const profileController = {
  async getMe(req: Request, res: Response, next: NextFunction) {
    try {
      const profile = await Profile.findOne({ userId: req.user!.userId });
      if (!profile) return next(new AppError('Profile not found', 404));
      res.json(profile);
    } catch (err) {
      next(err);
    }
  },

  async updateMe(req: Request, res: Response, next: NextFunction) {
    try {
      const { basic, background, vision, preferences } = req.body as {
        basic?: object;
        background?: object;
        vision?: object;
        preferences?: object;
      };

      const profile = await Profile.findOne({ userId: req.user!.userId });
      if (!profile) return next(new AppError('Profile not found', 404));

      if (basic) profile.basic = basic as Record<string, unknown>;
      if (background) profile.background = background as Record<string, unknown>;
      if (vision) profile.vision = vision as Record<string, unknown>;
      if (preferences) profile.preferences = preferences as Record<string, unknown>;

      await profile.save();
      res.json(profile);
    } catch (err) {
      next(err);
    }
  },
};
