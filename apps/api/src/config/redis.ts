import { Redis } from '@upstash/redis';
import { env } from './env.js';

// Upstash Redis for rate-limiting (REST-based)
export const redis = new Redis({
  url: env.UPSTASH_REDIS_REST_URL,
  token: env.UPSTASH_REDIS_REST_TOKEN,
});

// BullMQ requires ioredis-compatible connection config
export const bullMQConnection = {
  connection: {
    url: env.REDIS_URL,
    maxRetriesPerRequest: null, // required by BullMQ
    enableReadyCheck: false,
  },
};
