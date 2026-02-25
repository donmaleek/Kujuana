import mongoose from 'mongoose';
import { env } from './env.js';
import { logger } from './logger.js';
import { MongoMemoryServer } from 'mongodb-memory-server';

let memoryMongo: MongoMemoryServer | null = null;

export async function connectDB(): Promise<void> {
  try {
    let mongoUri = env.MONGODB_URI;
    if (env.USE_IN_MEMORY_MONGO) {
      memoryMongo = await MongoMemoryServer.create({
        instance: { dbName: 'kujuana' },
      });
      mongoUri = memoryMongo.getUri();
      logger.warn('Using in-memory MongoDB (development fallback)');
    }

    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    logger.info('MongoDB connected');
  } catch (err) {
    logger.error({ err }, 'MongoDB connection failed');
    throw err;
  }
}

export async function disconnectDB(): Promise<void> {
  await mongoose.disconnect();
  if (memoryMongo) {
    await memoryMongo.stop();
    memoryMongo = null;
  }
  logger.info('MongoDB disconnected');
}

mongoose.connection.on('disconnected', () => {
  logger.warn('MongoDB disconnected');
});

mongoose.connection.on('error', (err) => {
  logger.error({ err }, 'MongoDB error');
});
