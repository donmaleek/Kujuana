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

      const update: Record<string, object> = {};
      if (basic) update['basic'] = basic;
      if (background) update['background'] = background;
      if (vision) update['vision'] = vision;
      if (preferences) update['preferences'] = preferences;

      const profile = await Profile.findOneAndUpdate(
        { userId: req.user!.userId },
        { $set: update },
        { new: true },
      );

      res.json(profile);
    } catch (err) {
      next(err);
    }
  },
};
