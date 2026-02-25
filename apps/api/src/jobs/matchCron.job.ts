import { createQueue } from '../config/bullmq.js';
import { Profile } from '../models/Profile.model.js';
import { logger } from '../config/logger.js';

const standardQueue = createQueue('standard-match');

/**
 * Nightly standard matching job – runs at 02:00 EAT (23:00 UTC).
 * Enqueues all active standard-tier members for matching.
 */
export async function scheduleNightlyMatching() {
  await standardQueue.add(
    'nightly-trigger',
    { trigger: 'cron' },
    {
      repeat: { pattern: '0 23 * * *', tz: 'UTC' },
      jobId: 'nightly-matching',
    },
  );
  logger.info('Nightly matching cron scheduled');
}
