import type { SubscriptionTier } from '../enums/tiers.js';

export interface IMatch {
  _id: string;
  userId: string;
  matchedUserId: string;
  score: number;
  scoreBreakdown: IScoreBreakdown;
  tier: SubscriptionTier;
  status: MatchStatus;
  userAction?: MatchAction;
  matchedUserAction?: MatchAction;
  introductionNote?: string; // VIP matchmaker note
  createdAt: Date;
  updatedAt: Date;
}

export interface IScoreBreakdown {
  values: number;
  lifestyle: number;
  location: number;
  religion: number;
  ageCompatibility: number;
  vision: number;
  preferences: number;
  total: number;
}

export type MatchStatus =
  | 'pending'
  | 'active'
  | 'accepted'
  | 'declined'
  | 'expired';

export type MatchAction = 'accepted' | 'declined' | 'pending';
