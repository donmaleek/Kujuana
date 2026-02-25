import { Subscription } from '../models/Subscription.model.js';

export const subscriptionRepo = {
  findActiveByUserId: (userId: string) =>
    Subscription.findOne({ userId, status: 'active' }),

  findByUserId: (userId: string) =>
    Subscription.findOne({ userId }).sort({ createdAt: -1 }),
};
