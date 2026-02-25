import { createWorker } from '../config/bullmq.js';
import { matchingService } from '../services/matching/matching.service.js';
import { logger } from '../config/logger.js';

export const vipCurationWorker = createWorker<{ userId: string }>(
  'vip-curation',
  async (job) => {
    const { userId } = job.data;
    logger.info({ userId, jobId: job.id }, 'VIP curation job started');
    const matchIds = await matchingService.runVipCuration(userId);
    logger.info({ userId, matchIds }, 'VIP curation complete');
  },
);

vipCurationWorker.on('failed', (job, err) => {
  logger.error({ jobId: job?.id, err }, 'VIP curation job failed');
});
