import type { Request, Response, NextFunction } from 'express';
import { matchRepo } from '../repositories/match.repo.js';
import { matchRequestRepo } from '../repositories/matchRequest.repo.js';
import { queueService } from '../services/matching/queue.service.js';
import { subscriptionRepo } from '../repositories/subscription.repo.js';
import { AppError } from '../middleware/error.middleware.js';
import { SubscriptionTier } from '@kujuana/shared';

function getParam(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value;
}

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
      const matchId = getParam(req.params['id']);
      if (!matchId) return next(new AppError('Match id is required', 400));

      const match = await matchRepo.findByIdForUser(matchId, req.user!.userId);
      if (!match) {
        return next(new AppError('Match not found', 404));
      }
      res.json(match);
    } catch (err) {
      next(err);
    }
  },

  async respondToMatch(req: Request, res: Response, next: NextFunction) {
    try {
      const matchId = getParam(req.params['id']);
      if (!matchId) return next(new AppError('Match id is required', 400));

      const { action } = req.body as { action?: unknown };
      if (action !== 'accepted' && action !== 'declined') {
        return next(new AppError('action must be "accepted" or "declined"', 400));
      }

      const match = await matchRepo.respondToMatch(matchId, req.user!.userId, action);
      if (!match) return next(new AppError('Match not found', 404));

      res.json({
        status: match.status,
        userAction: match.userAction,
        matchedUserAction: match.matchedUserAction,
      });
    } catch (err) {
      next(err);
    }
  },

  async requestPriorityMatch(req: Request, res: Response, next: NextFunction) {
    try {
      const sub = await subscriptionRepo.findActiveByUserId(req.user!.userId);
      if (!sub || sub.tier !== SubscriptionTier.Priority) {
        return next(new AppError('Priority plan required', 403));
      }
      if (sub.priorityCredits < 1) {
        return next(new AppError('Insufficient credits', 402));
      }

      const activeRequest = await matchRequestRepo.findActiveByUserAndTier(
        req.user!.userId,
        SubscriptionTier.Priority,
      );
      if (activeRequest) {
        return next(new AppError('You already have a priority match request in progress', 409));
      }

      const request = await matchRequestRepo.create({
        userId: req.user!.userId,
        tier: SubscriptionTier.Priority,
        queueName: 'priority-match',
        maxAttempts: 3,
      });

      let jobId: string | null = null;
      try {
        const job = await queueService.enqueuePriorityMatch(
          req.user!.userId,
          request._id.toString(),
        );
        jobId = job.id?.toString() ?? null;
      } catch (queueErr) {
        await matchRequestRepo.failRequest(
          request._id.toString(),
          queueErr instanceof Error ? queueErr.message : 'Failed to enqueue priority match',
        );
        throw queueErr;
      }

      if (jobId) {
        await matchRequestRepo.attachBullJobId(
          request._id.toString(),
          jobId,
        );
      }

      res.status(202).json({
        message: 'Priority match request queued',
        requestId: request._id,
        jobId,
      });
    } catch (err) {
      next(err);
    }
  },
};
