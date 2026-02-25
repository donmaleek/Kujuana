import { scheduleNightlyMatching } from './matchCron.job.js';
import { logger } from '../config/logger.js';

export function startJobs() {
  scheduleNightlyMatching().catch((err) => {
    logger.error({ err }, 'Failed to schedule cron jobs');
  });
}
