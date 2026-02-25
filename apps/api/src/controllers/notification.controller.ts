import type { Request, Response, NextFunction } from 'express';
import { notificationRepo } from '../repositories/notification.repo.js';
import type { NotificationStatus } from '../models/Notification.model.js';
import { AppError } from '../middleware/error.middleware.js';

const ALLOWED_STATUSES = new Set<NotificationStatus>([
  'pending',
  'sent',
  'failed',
  'read',
]);

function parsePositiveInt(value: string | undefined, fallback: number): number {
  const parsed = Number.parseInt(value ?? '', 10);
  if (!Number.isFinite(parsed) || parsed <= 0) return fallback;
  return parsed;
}

function getParam(value: unknown): string | undefined {
  if (typeof value === 'string') return value;
  if (Array.isArray(value)) return value[0];
  return undefined;
}

export const notificationController = {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parsePositiveInt(getParam(req.query['page']), 1);
      const limit = Math.min(parsePositiveInt(getParam(req.query['limit']), 20), 100);
      const statusRaw = getParam(req.query['status']);
      const status = statusRaw && ALLOWED_STATUSES.has(statusRaw as NotificationStatus)
        ? (statusRaw as NotificationStatus)
        : undefined;

      const [items, total] = await Promise.all([
        notificationRepo.listByUser({
          userId: req.user!.userId,
          status,
          page,
          limit,
        }),
        notificationRepo.countByUser({
          userId: req.user!.userId,
          status,
        }),
      ]);

      res.json({
        items,
        page,
        limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      });
    } catch (err) {
      next(err);
    }
  },

  async markAsRead(req: Request, res: Response, next: NextFunction) {
    try {
      const id = getParam(req.params['id']);
      if (!id) return next(new AppError('Notification id is required', 400));

      const notification = await notificationRepo.markAsRead(id, req.user!.userId);
      if (!notification) {
        return next(new AppError('Notification not found', 404));
      }

      res.json(notification);
    } catch (err) {
      next(err);
    }
  },

  async markAllAsRead(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await notificationRepo.markAllAsRead(req.user!.userId);
      res.json({ modifiedCount: result.modifiedCount });
    } catch (err) {
      next(err);
    }
  },
};
