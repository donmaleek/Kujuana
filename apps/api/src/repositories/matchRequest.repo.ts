import { MatchRequest } from '../models/MatchRequest.model.js';
import { SubscriptionTier } from '@kujuana/shared';

export const matchRequestRepo = {
  findByUserId: (userId: string) =>
    MatchRequest.find({ userId }).sort({ createdAt: -1 }),

  findPending: () =>
    MatchRequest.find({ status: 'queued' }).sort({ queuedAt: 1 }),

  findActiveByUserAndTier: (userId: string, tier: SubscriptionTier) =>
    MatchRequest.findOne({
      userId,
      tier,
      status: { $in: ['queued', 'processing'] },
    }).sort({ createdAt: -1 }),

  findById: (id: string) => MatchRequest.findById(id),

  create: (data: {
    userId: string;
    tier: SubscriptionTier;
    queueName: string;
    paymentId?: string;
    maxAttempts?: number;
  }) =>
    MatchRequest.create(data),

  attachBullJobId: (id: string, bullJobId: string) =>
    MatchRequest.findByIdAndUpdate(
      id,
      { bullJobId },
      { new: true },
    ),

  failRequest: (id: string, lastError: string) =>
    MatchRequest.findByIdAndUpdate(
      id,
      {
        status: 'failed',
        lastError,
        completedAt: new Date(),
      },
      { new: true },
    ),
};
