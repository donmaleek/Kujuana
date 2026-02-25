import 'dotenv/config';
import { connectDB, disconnectDB } from '../config/db.js';
import { logger } from '../config/logger.js';

async function seed() {
  await connectDB();

  // Seed reference data here (countries, religions, etc.)
  // Models auto-create their indexes on first connect.

  logger.info('Seed complete');
  await disconnectDB();
}

seed().catch((err) => {
  logger.error({ err }, 'Seed failed');
  process.exit(1);
});
