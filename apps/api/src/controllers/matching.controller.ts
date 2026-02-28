import type { Request, Response, NextFunction } from 'express';
import { matchRepo } from '../repositories/match.repo.js';
import { matchRequestRepo } from '../repositories/matchRequest.repo.js';
import { queueService } from '../services/matching/queue.service.js';
import { subscriptionRepo } from '../repositories/subscription.repo.js';
import { AppError } from '../middleware/error.middleware.js';
import { SubscriptionTier } from '@kujuana/shared';
import { User } from '../models/User.model.js';
import { Profile } from '../models/Profile.model.js';

function getParam(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value;
}

async function withTimeout<T>(promise: Promise<T>, timeoutMs: number, message: string): Promise<T> {
  let timer: NodeJS.Timeout | null = null;
  try {
    return await Promise.race([
      promise,
      new Promise<T>((_resolve, reject) => {
        timer = setTimeout(() => reject(new AppError(message, 503, 'QUEUE_UNAVAILABLE')), timeoutMs);
      }),
    ]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}

export const matchingController = {
  async listMatches(req: Request, res: Response, next: NextFunction) {
    try {
      const matches = await matchRepo.findByUserId(req.user!.userId);
      const otherUserIds = Array.from(
        new Set(
          matches.map((match) =>
            match.userId.toString() === req.user!.userId
              ? match.matchedUserId.toString()
              : match.userId.toString(),
          ),
        ),
      );
      const [users, profiles] = await Promise.all([
        User.find({ _id: { $in: otherUserIds } }).select('fullName email'),
        Profile.find({ userId: { $in: otherUserIds } }).select('userId age location lifeVision photos'),
      ]);
      const userById = new Map(users.map((user) => [user._id.toString(), user]));
      const profileByUserId = new Map(profiles.map((profile) => [profile.userId.toString(), profile]));

      const items = matches.map((match) => {
        const mySideIsUser = match.userId.toString() === req.user!.userId;
        const otherUserId = mySideIsUser ? match.matchedUserId.toString() : match.userId.toString();
        const otherUser = userById.get(otherUserId);
        const otherProfile = profileByUserId.get(otherUserId);
        const locationLabel = otherProfile?.location?.city && otherProfile?.location?.country
          ? `${otherProfile.location.city}, ${otherProfile.location.country}`
          : otherProfile?.location?.city || otherProfile?.location?.country || null;

        return {
          id: match._id.toString(),
          _id: match._id.toString(),
          status: match.status,
          score: match.score,
          compatibilityScore: match.score,
          tier: match.tier,
          createdAt: (match as any).createdAt,
          updatedAt: (match as any).updatedAt,
          scoreBreakdown: match.scoreBreakdown,
          breakdown: match.scoreBreakdown,
          userAction: mySideIsUser ? match.userAction : match.matchedUserAction,
          otherUserId,
          other: {
            id: otherUserId,
            fullName: otherUser?.fullName ?? 'Match',
            firstName: (otherUser?.fullName ?? 'Match').split(' ')[0] ?? 'Match',
            age: otherProfile?.age ?? null,
            location: locationLabel,
            bio: otherProfile?.lifeVision ?? null,
            blurredPhotoUrl: otherProfile?.photos?.[0]?.url ?? null,
            photos: (otherProfile?.photos ?? [])
              .map((photo) => ({ url: photo.url }))
              .filter((photo) => typeof photo.url === 'string'),
          },
        };
      });

      const page = Number.parseInt(String(req.query['page'] ?? '1'), 10) || 1;
      const pageSize = Number.parseInt(String(req.query['pageSize'] ?? req.query['limit'] ?? '50'), 10) || 50;
      const total = items.length;

      res.json({
        items,
        page,
        pageSize,
        total,
        data: {
          items,
          page,
          pageSize,
          total,
        },
      });
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
      const otherUserId =
        match.userId.toString() === req.user!.userId
          ? match.matchedUserId.toString()
          : match.userId.toString();
      const [otherUser, otherProfile] = await Promise.all([
        User.findById(otherUserId).select('fullName email'),
        Profile.findOne({ userId: otherUserId }).select('age location lifeVision photos'),
      ]);
      const locationLabel = otherProfile?.location?.city && otherProfile?.location?.country
        ? `${otherProfile.location.city}, ${otherProfile.location.country}`
        : otherProfile?.location?.city || otherProfile?.location?.country || null;

      res.json({
        id: match._id.toString(),
        _id: match._id.toString(),
        status: match.status,
        score: match.score,
        compatibilityScore: match.score,
        tier: match.tier,
        createdAt: (match as any).createdAt,
        updatedAt: (match as any).updatedAt,
        scoreBreakdown: match.scoreBreakdown,
        breakdown: match.scoreBreakdown,
        userAction: match.userAction,
        matchedUserAction: match.matchedUserAction,
        otherUserId,
        other: {
          id: otherUserId,
          fullName: otherUser?.fullName ?? 'Match',
          name: otherUser?.fullName ?? 'Match',
          age: otherProfile?.age ?? null,
          location: locationLabel,
          bio: otherProfile?.lifeVision ?? null,
          photos: (otherProfile?.photos ?? [])
            .map((photo) => ({ url: photo.url }))
            .filter((photo) => typeof photo.url === 'string'),
        },
      });
    } catch (err) {
      next(err);
    }
  },

  async respondToMatch(req: Request, res: Response, next: NextFunction) {
    try {
      const matchId = getParam(req.params['id']);
      if (!matchId) return next(new AppError('Match id is required', 400));

      const { action } = req.body as { action?: unknown };
      const normalizedAction =
        action === 'accept' ? 'accepted'
        : action === 'decline' ? 'declined'
        : action;

      if (normalizedAction !== 'accepted' && normalizedAction !== 'declined') {
        return next(new AppError('action must be "accepted" or "declined"', 400));
      }

      const match = await matchRepo.respondToMatch(matchId, req.user!.userId, normalizedAction);
      if (!match) return next(new AppError('Match not found', 404));

      res.json({
        id: match._id.toString(),
        status: match.status,
        userAction: match.userAction,
        matchedUserAction: match.matchedUserAction,
        match,
      });
    } catch (err) {
      next(err);
    }
  },

  async requestPriorityMatch(req: Request, res: Response, next: NextFunction) {
    try {
      const sub = await subscriptionRepo.findActiveByUserId(req.user!.userId);
      if (!sub || ![SubscriptionTier.Priority, SubscriptionTier.VIP].includes(sub.tier)) {
        return next(new AppError('Priority or VIP plan required', 403));
      }
      if (sub.tier === SubscriptionTier.Priority && sub.priorityCredits < 1) {
        return next(new AppError('Insufficient credits', 402));
      }

      const activeRequest = await matchRequestRepo.findActiveByUserAndTier(
        req.user!.userId,
        sub.tier,
      );
      if (activeRequest) {
        return next(new AppError('You already have a priority match request in progress', 409));
      }

      const request = await matchRequestRepo.create({
        userId: req.user!.userId,
        tier: sub.tier,
        queueName: sub.tier === SubscriptionTier.VIP ? 'vip-curation' : 'priority-match',
        maxAttempts: 3,
      });

      let jobId: string | null = null;
      try {
        const job = await withTimeout(
          queueService.enqueuePriorityMatch(
            req.user!.userId,
            request._id.toString(),
          ),
          8000,
          'Match queue is temporarily unavailable. Please retry in a few moments.',
        );
        jobId = job.id?.toString() ?? null;
      } catch (queueErr) {
        await matchRequestRepo.failRequest(
          request._id.toString(),
          queueErr instanceof Error ? queueErr.message : 'Failed to enqueue priority match',
        );
        return next(
          new AppError(
            'Match queue is temporarily unavailable. Please retry in a few moments.',
            503,
            'QUEUE_UNAVAILABLE',
          ),
        );
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
