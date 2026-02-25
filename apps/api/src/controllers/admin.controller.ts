import type { Request, Response, NextFunction } from 'express';
import { User } from '../models/User.model.js';
import { Match } from '../models/Match.model.js';
import { MatchRequest } from '../models/MatchRequest.model.js';
import { Notification } from '../models/Notification.model.js';
import { Payment } from '../models/Payment.model.js';
import { AuditLog } from '../models/AuditLog.model.js';
import { matchmakerService } from '../services/admin/matchmaker.service.js';
import { moderationService } from '../services/admin/moderation.service.js';
import { AppError } from '../middleware/error.middleware.js';

interface CountBucket {
  _id: string | null;
  count: number;
}

function getParam(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value;
}

function toCountMap(buckets: CountBucket[] = []): Record<string, number> {
  return buckets.reduce<Record<string, number>>((acc, bucket) => {
    if (!bucket._id) return acc;
    acc[bucket._id] = bucket.count;
    return acc;
  }, {});
}

export const adminController = {
  async getStats(_req: Request, res: Response, next: NextFunction) {
    try {
      const [totalUsers, [stats], [requestStats], [notificationStats], [paymentStats]] = await Promise.all([
        User.countDocuments(),
        Match.aggregate<{
          total: { count: number }[];
          active: { count: number }[];
          byStatus: CountBucket[];
          byTier: CountBucket[];
          membersWithMatches: { count: number }[];
        }>([
          {
            $addFields: {
              pairKey: {
                $cond: [
                  { $lt: ['$userId', '$matchedUserId'] },
                  {
                    $concat: [
                      { $toString: '$userId' },
                      ':',
                      { $toString: '$matchedUserId' },
                    ],
                  },
                  {
                    $concat: [
                      { $toString: '$matchedUserId' },
                      ':',
                      { $toString: '$userId' },
                    ],
                  },
                ],
              },
            },
          },
          { $sort: { createdAt: -1 } },
          { $group: { _id: '$pairKey', match: { $first: '$$ROOT' } } },
          { $replaceRoot: { newRoot: '$match' } },
          {
            $facet: {
              total: [{ $count: 'count' }],
              active: [
                { $match: { status: { $in: ['pending', 'active'] } } },
                { $count: 'count' },
              ],
              byStatus: [{ $group: { _id: '$status', count: { $sum: 1 } } }],
              byTier: [{ $group: { _id: '$tier', count: { $sum: 1 } } }],
              membersWithMatches: [
                { $project: { members: ['$userId', '$matchedUserId'] } },
                { $unwind: '$members' },
                { $group: { _id: '$members' } },
                { $count: 'count' },
              ],
            },
          },
        ]),
        MatchRequest.aggregate<{
          total: { count: number }[];
          inQueue: { count: number }[];
          byStatus: CountBucket[];
          byTier: CountBucket[];
        }>([
          {
            $facet: {
              total: [{ $count: 'count' }],
              inQueue: [
                { $match: { status: { $in: ['queued', 'processing'] } } },
                { $count: 'count' },
              ],
              byStatus: [{ $group: { _id: '$status', count: { $sum: 1 } } }],
              byTier: [{ $group: { _id: '$tier', count: { $sum: 1 } } }],
            },
          },
        ]),
        Notification.aggregate<{
          total: { count: number }[];
          byStatus: CountBucket[];
          byType: CountBucket[];
          byChannel: CountBucket[];
        }>([
          {
            $facet: {
              total: [{ $count: 'count' }],
              byStatus: [{ $group: { _id: '$status', count: { $sum: 1 } } }],
              byType: [{ $group: { _id: '$type', count: { $sum: 1 } } }],
              byChannel: [{ $group: { _id: '$channel', count: { $sum: 1 } } }],
            },
          },
        ]),
        Payment.aggregate<{
          total: { count: number }[];
          totalAmount: { amount: number }[];
          byStatus: CountBucket[];
          byGateway: CountBucket[];
          byPurpose: CountBucket[];
        }>([
          {
            $facet: {
              total: [{ $count: 'count' }],
              totalAmount: [
                { $match: { status: 'completed' } },
                { $group: { _id: null, amount: { $sum: '$amount' } } },
              ],
              byStatus: [{ $group: { _id: '$status', count: { $sum: 1 } } }],
              byGateway: [{ $group: { _id: '$gateway', count: { $sum: 1 } } }],
              byPurpose: [{ $group: { _id: '$purpose', count: { $sum: 1 } } }],
            },
          },
        ]),
      ]);

      const totalMatches = stats?.total[0]?.count ?? 0;
      const activeMatches = stats?.active[0]?.count ?? 0;
      const matchedUsers = stats?.membersWithMatches[0]?.count ?? 0;
      const totalMatchRequests = requestStats?.total[0]?.count ?? 0;
      const queuedMatchRequests = requestStats?.inQueue[0]?.count ?? 0;
      const totalNotifications = notificationStats?.total[0]?.count ?? 0;
      const totalPayments = paymentStats?.total[0]?.count ?? 0;
      const completedPaymentAmount = paymentStats?.totalAmount[0]?.amount ?? 0;

      res.json({
        totalUsers,
        totalMatches,
        activeMatches,
        matchedUsers,
        totalMatchRequests,
        queuedMatchRequests,
        totalNotifications,
        totalPayments,
        completedPaymentAmount,
        matchesByStatus: toCountMap(stats?.byStatus),
        matchesByTier: toCountMap(stats?.byTier),
        matchRequestsByStatus: toCountMap(requestStats?.byStatus),
        matchRequestsByTier: toCountMap(requestStats?.byTier),
        notificationsByStatus: toCountMap(notificationStats?.byStatus),
        notificationsByType: toCountMap(notificationStats?.byType),
        notificationsByChannel: toCountMap(notificationStats?.byChannel),
        paymentsByStatus: toCountMap(paymentStats?.byStatus),
        paymentsByGateway: toCountMap(paymentStats?.byGateway),
        paymentsByPurpose: toCountMap(paymentStats?.byPurpose),
      });
    } catch (err) {
      next(err);
    }
  },

  async getVipQueue(_req: Request, res: Response, next: NextFunction) {
    try {
      const queue = await matchmakerService.getVipQueue();
      res.json(queue);
    } catch (err) {
      next(err);
    }
  },

  async introduceMatch(req: Request, res: Response, next: NextFunction) {
    try {
      const matchId = getParam(req.params['matchId']);
      if (!matchId) return next(new AppError('Missing match ID', 400));

      const note = typeof req.body?.note === 'string' ? req.body.note.trim() : '';

      await matchmakerService.introduceMatch(
        matchId,
        note,
        req.user!.userId,
      );
      res.json({ message: 'Match introduced' });
    } catch (err) {
      next(err);
    }
  },

  async getAuditLog(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt((req.query['page'] as string) ?? '1', 10);
      const limit = 50;
      const logs = await AuditLog.find()
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit);
      res.json(logs);
    } catch (err) {
      next(err);
    }
  },

  async suspendUser(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = getParam(req.params['userId']);
      if (!userId) return next(new AppError('Missing user ID', 400));

      const reason = typeof req.body?.reason === 'string' ? req.body.reason.trim() : '';
      if (!reason) return next(new AppError('Suspension reason is required', 400));

      await moderationService.suspendUser(
        userId,
        reason,
        req.user!.userId,
      );
      res.json({ message: 'User suspended' });
    } catch (err) {
      next(err);
    }
  },
};
