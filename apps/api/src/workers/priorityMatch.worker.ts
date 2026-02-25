import { createWorker } from '../config/bullmq.js';
import { matchingService } from '../services/matching/matching.service.js';
import { MatchRequest } from '../models/MatchRequest.model.js';
import { Subscription } from '../models/Subscription.model.js';
import { SubscriptionTier } from '@kujuana/shared';
import { AppError } from '../middleware/error.middleware.js';
import { logger } from '../config/logger.js';

export const priorityMatchWorker = createWorker<{
  userId: string;
  matchRequestId: string;
}>(
  'priority-match',
  async (job) => {
    const { userId, matchRequestId } = job.data;
    const attempt = job.attemptsMade + 1;
    const maxAttempts = job.opts.attempts ?? 3;
    logger.info({ userId, matchRequestId, jobId: job.id, attempt }, 'Priority match job started');

    const request = await MatchRequest.findOneAndUpdate(
      { _id: matchRequestId, userId, status: { $in: ['queued', 'processing'] } },
      {
        status: 'processing',
        startedAt: new Date(),
        attempts: attempt,
        maxAttempts,
      },
      { new: true },
    );

    if (!request) {
      logger.warn(
        { userId, matchRequestId, jobId: job.id },
        'Priority MatchRequest missing or already finalized; skipping',
      );
      return;
    }

    try {
      // Deduct one credit atomically BEFORE creating the match.
      // This prevents orphaned matches when the user has no credits.
      const credited = await Subscription.findOneAndUpdate(
        {
          userId,
          status: 'active',
          tier: SubscriptionTier.Priority,
          priorityCredits: { $gte: 1 },
        },
        { $inc: { priorityCredits: -1, totalCreditsUsed: 1 } },
        { new: true },
      );

      if (!credited) {
        throw new AppError('No active priority credits — cannot run match', 402);
      }

      const result = await matchingService.runPriorityMatching(userId);

      await MatchRequest.findByIdAndUpdate(matchRequestId, {
        status: 'completed',
        matchId: result.matchId,
        candidatesConsidered: result.candidatesConsidered,
        candidatesFiltered: result.candidatesFiltered,
        topScore: result.topScore,
        completedAt: new Date(),
        lastError: undefined,
      });

      logger.info(
        { userId, matchRequestId, matchId: result.matchId },
        'Priority match complete',
      );
    } catch (err) {
      if (err instanceof AppError && err.statusCode === 404) {
        await MatchRequest.findByIdAndUpdate(matchRequestId, {
          status: 'no_candidates',
          completedAt: new Date(),
          lastError: err.message,
        });
        logger.info(
          { userId, matchRequestId, attempt },
          'Priority match completed with no candidates',
        );
        return;
      }

      // No credits → terminal failure; do not retry
      if (err instanceof AppError && err.statusCode === 402) {
        await MatchRequest.findByIdAndUpdate(matchRequestId, {
          status: 'failed',
          completedAt: new Date(),
          lastError: err.message,
        });
        logger.warn({ userId, matchRequestId }, 'Priority match failed: no credits');
        return;
      }

      const isFinalAttempt = attempt >= maxAttempts;
      await MatchRequest.findByIdAndUpdate(matchRequestId, {
        status: isFinalAttempt ? 'failed' : 'queued',
        lastError: err instanceof Error ? err.message : 'Priority match job failed',
        ...(isFinalAttempt ? { completedAt: new Date() } : {}),
      });

      throw err;
    }
  },
);

priorityMatchWorker.on('failed', (job, err) => {
  logger.error({ jobId: job?.id, err }, 'Priority match job failed');
});
