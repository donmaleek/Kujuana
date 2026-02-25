import { MatchRequest } from '../models/MatchRequest.model.js';

export const matchRequestRepo = {
  findByUserId: (userId: string) =>
    MatchRequest.find({ userId }).sort({ createdAt: -1 }),

  findPending: () =>
    MatchRequest.find({ status: 'queued' }).sort({ requestedAt: 1 }),

  create: (data: { userId: string; tier: 'priority' | 'vip' }) =>
    MatchRequest.create(data),
};
