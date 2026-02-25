import { standardMatchWorker } from './standardMatch.worker.js';
import { priorityMatchWorker } from './priorityMatch.worker.js';
import { vipCurationWorker } from './vipCuration.worker.js';
import { logger } from '../config/logger.js';

export function startWorkers() {
  logger.info('BullMQ workers started');
  // Workers start automatically when imported; this function exists for explicit control
  return { standardMatchWorker, priorityMatchWorker, vipCurationWorker };
}
