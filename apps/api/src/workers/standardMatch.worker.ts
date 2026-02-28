import { createWorker, createQueue } from '../config/bullmq.js';
import { matchingService } from '../services/matching/matching.service.js';
import { Profile } from '../models/Profile.model.js';
import { User } from '../models/User.model.js';
import { logger } from '../config/logger.js';

const standardQueue = createQueue('standard-match');

interface StandardMatchData {
  userId?: string;
  trigger?: string;
}

export const standardMatchWorker = createWorker<StandardMatchData>(
  'standard-match',
  async (job) => {
    // Cron trigger: fan-out one job per submitted profile
    if (job.data.trigger === 'cron') {
      const members = await User.find({
        role: 'member',
        isActive: true,
        isSuspended: false,
      })
        .select('_id')
        .lean();
      const memberIds = members.map((member) => member._id);
      const profiles = await Profile.find({
        isSubmitted: true,
        userId: { $in: memberIds },
      })
        .select('userId')
        .lean();
      const jobs = profiles.map((p) => ({
        name: 'standard-match-user',
        data: { userId: String(p.userId) },
      }));
      if (jobs.length > 0) {
        await standardQueue.addBulk(jobs);
      }
      logger.info({ count: jobs.length }, 'Nightly standard matching fan-out complete');
      return;
    }

    const { userId } = job.data;
    if (!userId) throw new Error('Missing userId in standard-match job');
    logger.info({ userId, jobId: job.id }, 'Standard match job started');
    await matchingService.runStandardMatching(userId);
    logger.info({ userId, jobId: job.id }, 'Standard match job complete');
  },
);

standardMatchWorker.on('failed', (job, err) => {
  logger.error({ jobId: job?.id, err }, 'Standard match job failed');
});
