import type { SubscriptionTier, TierAddOn } from '../enums/tiers.js';

export interface ISubscription {
  _id: string;
  userId: string;
  tier: SubscriptionTier;
  status: SubscriptionStatus;
  credits: number;
  addOns: TierAddOn[];
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type SubscriptionStatus = 'active' | 'expired' | 'cancelled' | 'pending_payment';
