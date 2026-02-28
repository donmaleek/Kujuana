import type { Request, Response, NextFunction } from 'express';
import { logger } from '../config/logger.js';
import { ZodError } from 'zod';

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code?: string;

  constructor(
    message: string,
    statusCode: number = 500,
    code?: string,
  ) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.code = code;
  }
}

export function errorMiddleware(
  err: unknown,
  req: Request,
  res: Response,
  _next: NextFunction,
) {
  const requestContext = {
    requestId: req.requestId,
    method: req.method,
    path: req.originalUrl,
    userId: req.user?.userId,
  };

  if (err instanceof ZodError) {
    return res.status(400).json({
      error: 'Validation failed',
      details: err.flatten().fieldErrors,
      requestId: req.requestId,
    });
  }

  if (err instanceof AppError) {
    if (err.statusCode >= 500) {
      logger.error({ err, req: requestContext }, 'Server error');
    }
    return res.status(err.statusCode).json({
      error: err.message,
      ...(err.code && { code: err.code }),
      requestId: req.requestId,
    });
  }

  if (
    typeof err === 'object' &&
    err !== null &&
    'code' in err &&
    (err as { code?: unknown }).code === 11000
  ) {
    return res.status(409).json({
      error: 'Email or phone already registered',
      code: 'DUPLICATE_RESOURCE',
      requestId: req.requestId,
    });
  }

  logger.error({ err, req: requestContext }, 'Unhandled error');
  return res.status(500).json({ error: 'Internal server error', requestId: req.requestId });
}
