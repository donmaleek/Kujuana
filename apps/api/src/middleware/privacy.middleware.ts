import type { Request, Response, NextFunction } from 'express';
import { SubscriptionTier } from '@kujuana/shared';
import { subscriptionRepo } from '../repositories/subscription.repo.js';

/**
 * Attaches the requesting user's active subscription to res.locals
 * for use in downstream photo/field access decisions.
 */
export async function attachSubscription(req: Request, res: Response, next: NextFunction) {
  if (!req.user) return next();

  const subscription = await subscriptionRepo.findActiveByUserId(req.user.userId);
  res.locals.subscription = subscription;
  res.locals.tier = subscription?.tier ?? SubscriptionTier.Standard;
  next();
}
