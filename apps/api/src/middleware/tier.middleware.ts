import type { Request, Response, NextFunction } from 'express';
import { SubscriptionTier } from '@kujuana/shared';
import { AppError } from './error.middleware.js';
import { subscriptionRepo } from '../repositories/subscription.repo.js';

const TIER_RANK: Record<SubscriptionTier, number> = {
  [SubscriptionTier.Standard]: 1,
  [SubscriptionTier.Priority]: 2,
  [SubscriptionTier.VIP]: 3,
};

export function requireTier(minTier: SubscriptionTier) {
  return async (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) return next(new AppError('Unauthorized', 401));

    try {
      const subscription = await subscriptionRepo.findActiveByUserId(req.user.userId);
      if (!subscription || TIER_RANK[subscription.tier] < TIER_RANK[minTier]) {
        return next(
          new AppError(`This feature requires ${minTier} plan or higher`, 403, 'TIER_REQUIRED'),
        );
      }
      next();
    } catch (err) {
      next(err);
    }
  };
}
