import { createWorker } from '../config/bullmq.js';
import { matchingService } from '../services/matching/matching.service.js';
import { MatchRequest } from '../models/MatchRequest.model.js';
import { logger } from '../config/logger.js';

export const priorityMatchWorker = createWorker<{ userId: string }>(
  'priority-match',
  async (job) => {
    const { userId } = job.data;
    logger.info({ userId, jobId: job.id }, 'Priority match job started');

    const matchId = await matchingService.runPriorityMatching(userId);

    await MatchRequest.findOneAndUpdate(
      { userId, status: 'processing' },
      { status: 'completed', resultMatchId: matchId, completedAt: new Date() },
    );

    logger.info({ userId, matchId }, 'Priority match complete');
  },
);

priorityMatchWorker.on('failed', (job, err) => {
  logger.error({ jobId: job?.id, err }, 'Priority match job failed');
});
