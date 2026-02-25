import { createWorker } from '../config/bullmq.js';
import { matchingService } from '../services/matching/matching.service.js';
import { logger } from '../config/logger.js';

export const standardMatchWorker = createWorker<{ userId: string }>(
  'standard-match',
  async (job) => {
    const { userId } = job.data;
    logger.info({ userId, jobId: job.id }, 'Standard match job started');
    await matchingService.runStandardMatching(userId);
    logger.info({ userId, jobId: job.id }, 'Standard match job complete');
  },
);

standardMatchWorker.on('failed', (job, err) => {
  logger.error({ jobId: job?.id, err }, 'Standard match job failed');
});
