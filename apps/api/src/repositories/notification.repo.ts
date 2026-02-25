import { Notification } from '../models/Notification.model.js';
import type {
  NotificationStatus,
  NotificationType,
} from '../models/Notification.model.js';

interface CreateNotificationInput {
  userId: string;
  type: NotificationType;
  channel: 'push' | 'email' | 'both';
  title: string;
  body: string;
  data?: Record<string, unknown>;
  expoPushToken?: string;
  toEmail?: string;
  relatedMatchId?: string;
  relatedPaymentId?: string;
}

export const notificationRepo = {
  create: (input: CreateNotificationInput) => Notification.create(input),

  listByUser: ({
    userId,
    status,
    limit,
    page,
  }: {
    userId: string;
    status?: NotificationStatus;
    limit: number;
    page: number;
  }) =>
    Notification.find({
      userId,
      ...(status ? { status } : {}),
    })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),

  countByUser: ({
    userId,
    status,
  }: {
    userId: string;
    status?: NotificationStatus;
  }) =>
    Notification.countDocuments({
      userId,
      ...(status ? { status } : {}),
    }),

  markAsRead: (id: string, userId: string) =>
    Notification.findOneAndUpdate(
      { _id: id, userId },
      { status: 'read', readAt: new Date() },
      { new: true },
    ),

  markAllAsRead: (userId: string) =>
    Notification.updateMany(
      { userId, status: { $ne: 'read' } },
      { status: 'read', readAt: new Date() },
    ),
};
