import express from 'express';
import { router } from './routes/index.js';
import { errorMiddleware } from './middleware/error.middleware.js';
import { rateLimitMiddleware } from './middleware/rateLimit.middleware.js';

export function createApp() {
  const app = express();

  // Body parsing
  app.use(express.json({ limit: '10kb' }));
  app.use(express.urlencoded({ extended: true }));

  // Security headers
  app.disable('x-powered-by');
  app.use((_req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    next();
  });

  // Rate limiting (global)
  app.use(rateLimitMiddleware);

  // Health check (before auth)
  app.get('/health', (_req, res) => res.json({ status: 'ok' }));

  // API routes
  app.use('/api/v1', router);

  // Global error handler (must be last)
  app.use(errorMiddleware);

  return app;
}
