import type { Request, Response, NextFunction } from 'express';
import { subscriptionRepo } from '../repositories/subscription.repo.js';
import { AppError } from '../middleware/error.middleware.js';

export const subscriptionController = {
  async getMySubscription(req: Request, res: Response, next: NextFunction) {
    try {
      const sub = await subscriptionRepo.findByUserId(req.user!.userId);
      res.json(sub ?? { tier: 'none', status: 'none' });
    } catch (err) {
      next(err);
    }
  },

  async cancel(req: Request, res: Response, next: NextFunction) {
    try {
      const sub = await subscriptionRepo.findActiveByUserId(req.user!.userId);
      if (!sub) return next(new AppError('No active subscription', 404));
      sub.cancelAtPeriodEnd = true;
      await sub.save();
      res.json({ message: 'Subscription will cancel at end of period' });
    } catch (err) {
      next(err);
    }
  },
};
