
import express from 'express';
import cookieParser from 'cookie-parser';
import cors, { type CorsOptions } from 'cors';
import helmet from 'helmet';
import { router } from './routes/index.js';
import { errorMiddleware } from './middleware/error.middleware.js';
import { rateLimitMiddleware } from './middleware/rateLimit.middleware.js';
import { env } from './config/env.js';
import { logger } from './config/logger.js';
import { randomUUID } from 'crypto';
import mongoose from 'mongoose';
import type { Request, Express } from 'express';

export function createApp(): Express {
  const app = express();

  const allowedOrigins = Array.from(
    new Set(
      [env.WEB_BASE_URL, ...(process.env['WEB_ALLOWED_ORIGINS'] ?? '').split(',')]
        .map((origin) => origin.trim())
        .filter(Boolean),
    ),
  );

  // Security headers
  app.disable('x-powered-by');
  app.use(
    helmet({
      contentSecurityPolicy: false,
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    }),
  );

  // Request correlation id
  app.use((req, res, next) => {
    const incomingRequestId = req.header('x-request-id')?.trim();
    const requestId = incomingRequestId || randomUUID();
    req.requestId = requestId;
    res.setHeader('x-request-id', requestId);
    next();
  });

  // CORS
  const corsOptions: CorsOptions = {
    origin(origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      logger.warn({ origin }, 'CORS origin blocked');
      return callback(null, false);
    },
    credentials: true,
  };
  app.use(cors(corsOptions));

  // Body parsing
  app.use(
    express.json({
      limit: '32kb',
      verify: (req, _res, buffer) => {
        (req as Request).rawBody = buffer.toString('utf8');
      },
    }),
  );
  app.use(express.urlencoded({ extended: true, limit: '32kb' }));
  app.use(cookieParser());

  // Structured request logging
  app.use((req, res, next) => {
    const startedAt = process.hrtime.bigint();
    res.on('finish', () => {
      const elapsedMs = Number(process.hrtime.bigint() - startedAt) / 1_000_000;
      logger.info(
        {
          requestId: req.requestId,
          method: req.method,
          path: req.originalUrl,
          statusCode: res.statusCode,
          durationMs: Number(elapsedMs.toFixed(2)),
          ip: req.ip,
          userId: req.user?.userId,
        },
        'HTTP request',
      );
    });
    next();
  });

  // Health checks
  app.get('/health/live', (_req, res) => {
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.floor(process.uptime()),
    });
  });
  app.get('/health/ready', (_req, res) => {
    const mongoReady = mongoose.connection.readyState === 1;
    const readiness = {
      status: mongoReady ? 'ready' : 'degraded',
      checks: { mongodb: mongoReady ? 'up' : 'down' },
      timestamp: new Date().toISOString(),
    };
    return res.status(mongoReady ? 200 : 503).json(readiness);
  });
  app.get('/health', (_req, res) => {
    const mongoReady = mongoose.connection.readyState === 1;
    res.status(mongoReady ? 200 : 503).json({
      status: mongoReady ? 'ok' : 'degraded',
      checks: { mongodb: mongoReady ? 'up' : 'down' },
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.floor(process.uptime()),
    });
  });

  // Rate limiting (global)
  app.use(rateLimitMiddleware);

  // API routes
  app.use('/api/v1', router);

  // Global error handler (must be last)
  app.use(errorMiddleware);

  return app;
}
