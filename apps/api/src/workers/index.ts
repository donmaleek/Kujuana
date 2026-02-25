import { standardMatchWorker } from './standardMatch.worker.js';
import { priorityMatchWorker } from './priorityMatch.worker.js';
import { vipCurationWorker } from './vipCuration.worker.js';
import { logger } from '../config/logger.js';

export function startWorkers() {
  logger.info('BullMQ workers started');
  // Workers start automatically when imported; this function exists for explicit control.
  void standardMatchWorker;
  void priorityMatchWorker;
  void vipCurationWorker;
}

export async function stopWorkers(): Promise<void> {
  await Promise.allSettled([
    standardMatchWorker.close(),
    priorityMatchWorker.close(),
    vipCurationWorker.close(),
  ]);
  logger.info('BullMQ workers stopped');
}
