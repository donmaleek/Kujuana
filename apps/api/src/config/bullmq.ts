import { Queue, Worker, type Processor } from 'bullmq';
import { bullMQConnection } from './redis.js';

export type QueueName = 'standard-match' | 'priority-match' | 'vip-curation';

export function createQueue(name: QueueName) {
  return new Queue(name, {
    ...bullMQConnection,
    defaultJobOptions: {
      attempts: 3,
      backoff: { type: 'exponential', delay: 5000 },
      removeOnComplete: { count: 100 },
      removeOnFail: { count: 50 },
    },
  });
}

export function createWorker<T>(name: QueueName, processor: Processor<T>) {
  return new Worker<T>(name, processor, {
    ...bullMQConnection,
    concurrency: 5,
  });
}
