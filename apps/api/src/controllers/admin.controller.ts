import type { Request, Response, NextFunction } from 'express';
import { User } from '../models/User.model.js';
import { Match } from '../models/Match.model.js';
import { MatchRequest } from '../models/MatchRequest.model.js';
import { Notification } from '../models/Notification.model.js';
import { Payment } from '../models/Payment.model.js';
import { AuditLog } from '../models/AuditLog.model.js';
import { Profile } from '../models/Profile.model.js';
import { Subscription } from '../models/Subscription.model.js';
import { matchmakerService } from '../services/admin/matchmaker.service.js';
import { moderationService } from '../services/admin/moderation.service.js';
import { AppError } from '../middleware/error.middleware.js';
import mongoose from 'mongoose';
import { env } from '../config/env.js';

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

function parsePositiveInt(value: unknown, fallback: number): number {
  const parsed = Number.parseInt(String(value ?? ''), 10);
  if (!Number.isFinite(parsed) || parsed <= 0) return fallback;
  return parsed;
}

const MEMBER_ONLY_QUERY = { role: 'member' } as const;

export const adminController = {
  async bootstrapAdmin(req: Request, res: Response, next: NextFunction) {
    try {
      const configuredSecret = env.ADMIN_INVITE_SECRET?.trim();
      if (!configuredSecret) {
        return next(new AppError('Admin bootstrap is not configured', 503));
      }

      const secret = String(req.body?.secret ?? '').trim();
      const email = String(req.body?.email ?? '')
        .toLowerCase()
        .trim();
      const allowExistingAdminBootstrap =
        env.NODE_ENV !== 'production' && req.body?.allowExistingAdmin === true;

      if (!secret || !email) {
        return next(new AppError('Email and secret are required', 400));
      }
      if (secret !== configuredSecret) {
        return next(new AppError('Invalid bootstrap secret', 403));
      }

      const existingAdmins = await User.countDocuments({
        $or: [{ role: 'admin' }, { roles: 'admin' }],
      });

      const user = await User.findOne({ email });
      if (!user) return next(new AppError('User not found', 404));

      if (existingAdmins > 0 && !allowExistingAdminBootstrap) {
        if (user.role === 'admin' || (Array.isArray(user.roles) && user.roles.includes('admin'))) {
          return res.status(200).json({
            message: 'User is already an admin',
            user: {
              id: user._id.toString(),
              email: user.email,
              fullName: user.fullName,
              role: user.role,
              roles: user.roles,
            },
          });
        }

        return next(new AppError('Admin bootstrap already completed', 409));
      }

      user.role = 'admin';
      user.roles = ['admin'];
      user.isEmailVerified = true;
      await user.save();

      res.status(201).json({
        message: 'Admin account bootstrapped successfully',
        user: {
          id: user._id.toString(),
          email: user.email,
          fullName: user.fullName,
          role: user.role,
          roles: user.roles,
        },
      });
    } catch (err) {
      next(err);
    }
  },

  async getStats(_req: Request, res: Response, next: NextFunction) {
    try {
      const [totalMembers, totalAccounts, [stats], [requestStats], [notificationStats], [paymentStats]] = await Promise.all([
        User.countDocuments(MEMBER_ONLY_QUERY),
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
      const activeMembers = await User.countDocuments({
        ...MEMBER_ONLY_QUERY,
        isActive: true,
        isSuspended: false,
      });
      const vipMembers = await Subscription.countDocuments({ tier: 'vip', status: 'active' });
      const [priorityCreditsRow] = await Subscription.aggregate<{ total: number }>([
        { $group: { _id: null, total: { $sum: '$priorityCredits' } } },
      ]);
      const priorityCreditsOutstanding = priorityCreditsRow?.total ?? 0;

      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const [revenueMonth] = await Payment.aggregate<{
        kes: Array<{ amount: number }>;
        usd: Array<{ amount: number }>;
      }>([
        {
          $match: {
            status: 'completed',
            createdAt: { $gte: startOfMonth },
          },
        },
        {
          $facet: {
            kes: [
              { $match: { currency: 'KES' } },
              { $group: { _id: null, amount: { $sum: '$amount' } } },
            ],
            usd: [
              { $match: { currency: 'USD' } },
              { $group: { _id: null, amount: { $sum: '$amount' } } },
            ],
          },
        },
      ]);
      const revenueMonthKES = revenueMonth?.kes?.[0]?.amount ?? 0;
      const revenueMonthUSD = revenueMonth?.usd?.[0]?.amount ?? 0;
      const matchesPending = (toCountMap(stats?.byStatus)['pending'] ?? 0) + (toCountMap(stats?.byStatus)['active'] ?? 0);

      res.json({
        totalUsers: totalMembers,
        totalAccounts,
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

        // Frontend admin dashboard compatibility fields.
        ok: true,
        generatedAt: new Date().toISOString(),
        membersTotal: totalMembers,
        activeMembers,
        matchesTotal: totalMatches,
        matchesPending,
        vipMembers,
        priorityCreditsOutstanding,
        revenueMonthKES,
        revenueMonthUSD,
      });
    } catch (err) {
      next(err);
    }
  },

  async getVipQueue(_req: Request, res: Response, next: NextFunction) {
    try {
      const [vipQueue, priorityQueue] = await Promise.all([
        matchmakerService.getVipQueue(),
        MatchRequest.find({ status: { $in: ['queued', 'processing'] } })
          .sort({ createdAt: 1 })
          .populate('userId', 'fullName email')
          .populate({
            path: 'matchId',
            select: 'score matchedUserId',
            populate: { path: 'matchedUserId', select: 'fullName email' },
          }),
      ]);

      const now = Date.now();
      const vipRows = vipQueue.map((item: any) => {
        const createdAt = item.createdAt ?? new Date();
        const requesterName = item.userId?.fullName ?? 'Member';
        const candidateName = item.matchedUserId?.fullName ?? 'Candidate';
        return {
          id: item._id.toString(),
          tier: 'vip',
          kind: 'vip',
          status: item.status ?? 'pending',
          createdAt,
          requesterName,
          requestedByName: requesterName,
          requestedByUserId: item.userId?._id?.toString() ?? '',
          requestedByEmail: item.userId?.email,
          candidateName,
          score: Number(item.score ?? 0),
          waitHours: (now - new Date(createdAt).getTime()) / (1000 * 60 * 60),
          matchId: item._id.toString(),
        };
      });

      const priorityRows = priorityQueue.map((item: any) => {
        const createdAt = item.createdAt ?? item.queuedAt ?? new Date();
        const requesterName = item.userId?.fullName ?? 'Member';
        const matchedUser = item.matchId?.matchedUserId;
        const candidateName = matchedUser?.fullName ?? 'Pending allocation';
        const matchId = item.matchId?._id?.toString();
        return {
          id: matchId ?? item._id.toString(),
          tier: item.tier ?? 'priority',
          kind: item.tier ?? 'priority',
          status:
            item.status === 'queued'
              ? 'pending'
              : item.status === 'processing'
                ? 'review'
                : item.status,
          createdAt,
          requesterName,
          requestedByName: requesterName,
          requestedByUserId: item.userId?._id?.toString() ?? '',
          requestedByEmail: item.userId?.email,
          candidateName,
          score: Number(item.matchId?.score ?? item.topScore ?? 0),
          waitHours: (now - new Date(createdAt).getTime()) / (1000 * 60 * 60),
          matchId,
          requestId: item._id.toString(),
        };
      });

      const rows = [...vipRows, ...priorityRows].sort(
        (a, b) => +new Date(b.createdAt) - +new Date(a.createdAt),
      );

      res.json({
        items: rows,
        data: rows,
      });
    } catch (err) {
      next(err);
    }
  },

  async markQueueInReview(req: Request, res: Response, next: NextFunction) {
    try {
      const requestId = getParam(req.params['requestId']);
      if (!requestId) return next(new AppError('Missing request ID', 400));

      const request = mongoose.Types.ObjectId.isValid(requestId)
        ? await MatchRequest.findByIdAndUpdate(
            requestId,
            { status: 'processing' },
            { new: true },
          )
        : null;
      const fallbackRequest = request ?? await MatchRequest.findOneAndUpdate(
        { matchId: requestId },
        { status: 'processing' },
        { new: true },
      );
      if (!fallbackRequest) return next(new AppError('Queue item not found', 404));

      res.json({
        message: 'Queue item marked in review',
        item: fallbackRequest,
      });
    } catch (err) {
      next(err);
    }
  },

  async listMembers(req: Request, res: Response, next: NextFunction) {
    try {
      const q = String(req.query['q'] ?? '').trim();
      const tier = String(req.query['tier'] ?? '').trim().toLowerCase();
      const limit = Math.min(parsePositiveInt(req.query['limit'], 50), 100);

      const userQuery: Record<string, unknown> = { ...MEMBER_ONLY_QUERY };
      if (q) {
        const regex = new RegExp(q, 'i');
        userQuery.$or = [{ fullName: regex }, { email: regex }];
        if (mongoose.Types.ObjectId.isValid(q)) {
          userQuery.$or = [...(userQuery.$or as Array<Record<string, unknown>>), { _id: q }];
        }
      }

      const users = await User.find(userQuery)
        .sort({ createdAt: -1 })
        .limit(limit);

      const userIds = users.map((user) => user._id.toString());
      const [profiles, subscriptions] = await Promise.all([
        Profile.find({ userId: { $in: userIds } }).select('userId completeness profileCompleteness isActive lastActive'),
        Subscription.find({ userId: { $in: userIds } })
          .sort({ createdAt: -1 })
          .select('userId tier priorityCredits'),
      ]);

      const profileByUserId = new Map(
        profiles.map((profile) => [profile.userId.toString(), profile]),
      );
      const subscriptionByUserId = new Map<string, (typeof subscriptions)[number]>();
      subscriptions.forEach((sub) => {
        if (!subscriptionByUserId.has(sub.userId.toString())) {
          subscriptionByUserId.set(sub.userId.toString(), sub);
        }
      });

      const rows = users
        .map((user) => {
          const uid = user._id.toString();
          const profile = profileByUserId.get(uid);
          const sub = subscriptionByUserId.get(uid);
          return {
            id: uid,
            fullName: user.fullName,
            email: user.email,
            tier: sub?.tier ?? 'standard',
            credits: sub?.priorityCredits ?? 0,
            isActive: Boolean(user.isActive && !user.isSuspended && (profile?.isActive ?? true)),
            profileCompleteness: profile?.completeness?.overall ?? profile?.profileCompleteness ?? 0,
            createdAt: (user as any).createdAt,
            lastSeenAt: profile?.lastActive ?? (user as any).updatedAt,
          };
        })
        .filter((row) => (tier ? row.tier === tier : true));

      res.json({
        items: rows,
        data: rows,
      });
    } catch (err) {
      next(err);
    }
  },

  async getMember(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = getParam(req.params['userId']);
      if (!userId) return next(new AppError('Missing user ID', 400));

      const [user, profile, subscription] = await Promise.all([
        User.findById(userId),
        Profile.findOne({ userId }),
        Subscription.findOne({ userId }).sort({ createdAt: -1 }),
      ]);
      if (!user) return next(new AppError('User not found', 404));

      res.json({
        id: user._id.toString(),
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        tier: subscription?.tier ?? 'standard',
        credits: subscription?.priorityCredits ?? 0,
        profileCompleteness: profile?.completeness?.overall ?? profile?.profileCompleteness ?? 0,
        isActive: Boolean(user.isActive && !user.isSuspended),
        createdAt: (user as any).createdAt,
        profile: profile?.toJSON() ?? null,
      });
    } catch (err) {
      next(err);
    }
  },

  async getMatchDetail(req: Request, res: Response, next: NextFunction) {
    try {
      const matchId = getParam(req.params['matchId']);
      if (!matchId) return next(new AppError('Missing match ID', 400));

      const match = await Match.findById(matchId)
        .populate('userId', 'fullName email')
        .populate('matchedUserId', 'fullName email');
      if (!match) return next(new AppError('Match not found', 404));

      const userA = match.userId as any;
      const userB = match.matchedUserId as any;

      res.json({
        id: match._id.toString(),
        tier: match.tier,
        status: match.status,
        score: match.score,
        compatibilityScore: match.score,
        createdAt: (match as any).createdAt,
        updatedAt: (match as any).updatedAt,
        breakdown: match.scoreBreakdown,
        notes: match.introductionNote ?? null,
        users: [
          {
            id: userA?._id?.toString() ?? match.userId.toString(),
            userId: userA?._id?.toString() ?? match.userId.toString(),
            fullName: userA?.fullName ?? 'Member A',
            email: userA?.email ?? '',
            tier: match.tier,
          },
          {
            id: userB?._id?.toString() ?? match.matchedUserId.toString(),
            userId: userB?._id?.toString() ?? match.matchedUserId.toString(),
            fullName: userB?.fullName ?? 'Member B',
            email: userB?.email ?? '',
            tier: match.tier,
          },
        ],
        userA: {
          id: userA?._id?.toString() ?? match.userId.toString(),
          fullName: userA?.fullName ?? 'Member A',
          email: userA?.email ?? '',
        },
        userB: {
          id: userB?._id?.toString() ?? match.matchedUserId.toString(),
          fullName: userB?.fullName ?? 'Member B',
          email: userB?.email ?? '',
        },
      });
    } catch (err) {
      next(err);
    }
  },

  async saveMatchNote(req: Request, res: Response, next: NextFunction) {
    try {
      const matchId = getParam(req.params['matchId']);
      if (!matchId) return next(new AppError('Missing match ID', 400));

      const note = typeof req.body?.note === 'string' ? req.body.note.trim() : '';
      const match = await Match.findByIdAndUpdate(
        matchId,
        { introductionNote: note },
        { new: true },
      );
      if (!match) return next(new AppError('Match not found', 404));

      res.json({
        message: 'Match note saved',
        note: match.introductionNote ?? '',
      });
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
        .populate('actorId', 'email fullName')
        .populate('targetUserId', 'email fullName')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit);
      const rows = logs.map((log: any) => ({
        id: log._id.toString(),
        actor: log.actorId?.email ?? log.actorId?.fullName ?? 'system',
        action: log.action,
        target: log.targetUserId?.email ?? log.targetUserId?._id?.toString() ?? null,
        ip: log.ipAddress ?? null,
        createdAt: log.createdAt,
        actorId: log.actorId?._id?.toString(),
        actorEmail: log.actorId?.email,
        targetUserId: log.targetUserId?._id?.toString(),
        targetEmail: log.targetUserId?.email,
        meta: log.metadata ?? {},
      }));

      res.json({
        items: rows,
        data: rows,
      });
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
