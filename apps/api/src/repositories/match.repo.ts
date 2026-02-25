import { Match } from '../models/Match.model.js';
import type { SubscriptionTier, IScoreBreakdown } from '@kujuana/shared';

interface CreateMatchInput {
  userId: string;
  matchedUserId: string;
  score: number;
  scoreBreakdown: IScoreBreakdown;
  tier: SubscriptionTier;
  status?: string;
}

export const matchRepo = {
  findByUserId: (userId: string) =>
    Match.find({ userId }).sort({ createdAt: -1 }),

  findById: (id: string) => Match.findById(id),

  createMatch: (input: CreateMatchInput) => Match.create(input),

  findExisting: (userId: string, matchedUserId: string) =>
    Match.findOne({ userId, matchedUserId }),
};
