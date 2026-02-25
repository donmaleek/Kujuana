import 'dotenv/config';
import { createApp } from './app.js';
import { connectDB } from './config/db.js';
import { logger } from './config/logger.js';
import { env } from './config/env.js';
import { ensureIndexes } from './db/indexes.js';
import { startWorkers, stopWorkers } from './workers/index.js';
import { startJobs } from './jobs/index.js';

async function main() {
  await connectDB();
  await ensureIndexes();


  const app = createApp();

  // Set trust proxy if behind a proxy (e.g., production)
  if (env.NODE_ENV === 'production') {
    app.set('trust proxy', 1);
    logger.info('Trust proxy enabled');
  }

  const server = app.listen(env.PORT, () => {
    logger.info(`API listening on port ${env.PORT} [${env.NODE_ENV}]`);
  });

  // Start BullMQ workers
  startWorkers();

  // Start cron jobs
  startJobs();

  // Graceful shutdown
  const shutdown = async (signal: string) => {
    logger.info(`${signal} received – shutting down gracefully`);
    server.close(async () => {
      await stopWorkers();
      const { disconnectDB } = await import('./config/db.js');
      await disconnectDB();
      logger.info('Server closed');
      process.exit(0);
    });

    // Force exit if graceful shutdown takes too long
    setTimeout(() => {
      logger.error('Forced shutdown after timeout');
      process.exit(1);
    }, 10_000);
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}


main().catch((err) => {
  logger.error({ err }, 'Fatal startup error');
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason) => {
  logger.error({ reason }, 'Unhandled promise rejection');
  process.exit(1);
});
