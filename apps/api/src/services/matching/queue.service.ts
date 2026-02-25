import { createQueue } from '../../config/bullmq.js';

const standardQueue = createQueue('standard-match');
const priorityQueue = createQueue('priority-match');
const vipQueue = createQueue('vip-curation');

export const queueService = {
  async enqueueStandardMatch(userId: string) {
    return standardQueue.add('match', { userId }, { jobId: `standard-${userId}` });
  },

  async enqueuePriorityMatch(userId: string, matchRequestId: string) {
    return priorityQueue.add(
      'match',
      { userId, matchRequestId },
      { priority: 1, attempts: 3, jobId: `priority-${matchRequestId}` },
    );
  },

  async enqueueVipCuration(userId: string) {
    return vipQueue.add('curate', { userId }, { priority: 1 });
  },
};
