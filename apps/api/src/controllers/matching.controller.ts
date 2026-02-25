import type { Request, Response, NextFunction } from 'express';
import { matchRepo } from '../repositories/match.repo.js';
import { queueService } from '../services/matching/queue.service.js';
import { subscriptionRepo } from '../repositories/subscription.repo.js';
import { AppError } from '../middleware/error.middleware.js';
import { SubscriptionTier } from '@kujuana/shared';

export const matchingController = {
  async listMatches(req: Request, res: Response, next: NextFunction) {
    try {
      const matches = await matchRepo.findByUserId(req.user!.userId);
      res.json(matches);
    } catch (err) {
      next(err);
    }
  },

  async getMatch(req: Request, res: Response, next: NextFunction) {
    try {
      const match = await matchRepo.findById(req.params['id']!);
      if (!match || match.userId.toString() !== req.user!.userId) {
        return next(new AppError('Match not found', 404));
      }
      res.json(match);
    } catch (err) {
      next(err);
    }
  },

  async requestPriorityMatch(req: Request, res: Response, next: NextFunction) {
    try {
      const sub = await subscriptionRepo.findActiveByUserId(req.user!.userId);
      if (!sub || sub.tier === SubscriptionTier.Standard) {
        return next(new AppError('Priority plan required', 403));
      }
      if (sub.credits < 1) {
        return next(new AppError('Insufficient credits', 402));
      }
      sub.credits -= 1;
      await sub.save();

      await queueService.enqueuePriorityMatch(req.user!.userId);
      res.json({ message: 'Priority match request queued' });
    } catch (err) {
      next(err);
    }
  },
};
