import { Schema, model, type Document, type Types } from 'mongoose';
import { SubscriptionTier } from '@kujuana/shared';
import type { SubscriptionStatus, TierAddOn } from '@kujuana/shared';

type SubscriptionHistoryAction =
  | 'upgraded'
  | 'downgraded'
  | 'cancelled'
  | 'renewed'
  | 'expired';

const SUBSCRIPTION_STATUS_VALUES: SubscriptionStatus[] = [
  'active',
  'expired',
  'cancelled',
  'pending_payment',
];

const TIER_ADD_ON_VALUES: TierAddOn[] = [
  'extra_credits',
  'profile_boost',
  'international_filter',
];

export interface ISubscriptionHistory {
  tier: SubscriptionTier;
  action: SubscriptionHistoryAction;
  from: SubscriptionTier;
  to: SubscriptionTier;
  paymentId?: Types.ObjectId;
  changedAt: Date;
  note?: string;
}

export interface ISubscriptionDocument extends Document {
  userId: Types.ObjectId;
  tier: SubscriptionTier;
  status: SubscriptionStatus;
  priorityCredits: number;
  totalCreditsPurchased: number;
  totalCreditsUsed: number;
  vipMonthlyMatchLimit: number;
  vipMatchesUsedThisCycle: number;
  vipCycleStartedAt?: Date;
  vipCycleResetAt?: Date;
  vipAddOns: TierAddOn[];
  currentPeriodStart?: Date;
  currentPeriodEnd?: Date;
  autoRenew: boolean;
  lastPaymentId?: Types.ObjectId;
  lastPaymentAt?: Date;
  nextBillingAt?: Date;
  cancelAtPeriodEnd: boolean;
  scheduledTier?: SubscriptionTier;
  history: ISubscriptionHistory[];

  // Legacy aliases kept for backward compatibility.
  credits: number;
  addOns: TierAddOn[];

  hasCredits(): boolean;
  isVipActive(): boolean;
  canUseAddOn(addOn: TierAddOn): boolean;
  decrementCredit(): Promise<void>;
  resetVipCycle(): void;
}

const subscriptionHistorySchema = new Schema<ISubscriptionHistory>(
  {
    tier: { type: String, enum: Object.values(SubscriptionTier), required: true },
    action: {
      type: String,
      enum: ['upgraded', 'downgraded', 'cancelled', 'renewed', 'expired'],
      required: true,
    },
    from: { type: String, enum: Object.values(SubscriptionTier), required: true },
    to: { type: String, enum: Object.values(SubscriptionTier), required: true },
    paymentId: { type: Schema.Types.ObjectId, ref: 'Payment' },
    changedAt: { type: Date, default: Date.now },
    note: { type: String },
  },
  { _id: false },
);

const subscriptionSchema = new Schema<ISubscriptionDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    tier: {
      type: String,
      enum: Object.values(SubscriptionTier),
      default: SubscriptionTier.Standard,
    },
    status: {
      type: String,
      enum: SUBSCRIPTION_STATUS_VALUES,
      default: 'active',
    },
    priorityCredits: { type: Number, default: 0, min: 0 },
    totalCreditsPurchased: { type: Number, default: 0, min: 0 },
    totalCreditsUsed: { type: Number, default: 0, min: 0 },
    vipMonthlyMatchLimit: { type: Number, default: 30, min: 1 },
    vipMatchesUsedThisCycle: { type: Number, default: 0, min: 0 },
    vipCycleStartedAt: { type: Date },
    vipCycleResetAt: { type: Date },
    vipAddOns: { type: [String], enum: TIER_ADD_ON_VALUES, default: [] },
    currentPeriodStart: { type: Date },
    currentPeriodEnd: { type: Date },
    autoRenew: { type: Boolean, default: true },
    lastPaymentId: { type: Schema.Types.ObjectId, ref: 'Payment' },
    lastPaymentAt: { type: Date },
    nextBillingAt: { type: Date },
    cancelAtPeriodEnd: { type: Boolean, default: false },
    scheduledTier: {
      type: String,
      enum: Object.values(SubscriptionTier),
    },
    history: {
      type: [subscriptionHistorySchema],
      default: [],
    },
  },
  { timestamps: true, versionKey: false },
);

subscriptionSchema.index({ userId: 1, status: 1 });
subscriptionSchema.index({ tier: 1, status: 1 });
subscriptionSchema.index({ currentPeriodEnd: 1 });
subscriptionSchema.index({ nextBillingAt: 1 });

subscriptionSchema.virtual('credits')
  .get(function getCredits(this: ISubscriptionDocument) {
    return this.priorityCredits;
  })
  .set(function setCredits(this: ISubscriptionDocument, value: number) {
    this.priorityCredits = Math.max(0, Number(value) || 0);
  });

subscriptionSchema.virtual('addOns')
  .get(function getAddOns(this: ISubscriptionDocument) {
    return this.vipAddOns;
  })
  .set(function setAddOns(this: ISubscriptionDocument, value: TierAddOn[]) {
    this.vipAddOns = Array.isArray(value) ? value : [];
  });

subscriptionSchema.methods.hasCredits = function hasCredits(this: ISubscriptionDocument): boolean {
  return this.priorityCredits > 0;
};

subscriptionSchema.methods.isVipActive = function isVipActive(this: ISubscriptionDocument): boolean {
  return (
    this.tier === SubscriptionTier.VIP &&
    this.status === 'active' &&
    (!this.currentPeriodEnd || this.currentPeriodEnd > new Date())
  );
};

subscriptionSchema.methods.canUseAddOn = function canUseAddOn(
  this: ISubscriptionDocument,
  addOn: TierAddOn,
): boolean {
  return this.isVipActive() && this.vipAddOns.includes(addOn);
};

subscriptionSchema.methods.decrementCredit = async function decrementCredit(
  this: ISubscriptionDocument,
): Promise<void> {
  if (this.priorityCredits <= 0) {
    throw new Error('Insufficient priority credits');
  }
  this.priorityCredits -= 1;
  this.totalCreditsUsed += 1;
  await this.save();
};

subscriptionSchema.methods.resetVipCycle = function resetVipCycle(this: ISubscriptionDocument): void {
  this.vipMatchesUsedThisCycle = 0;
  this.vipCycleStartedAt = new Date();
  this.vipCycleResetAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
};

subscriptionSchema.pre('save', function syncTierLifecycle(next) {
  if (this.tier === SubscriptionTier.VIP) {
    const cycleStart = this.currentPeriodStart ?? new Date();
    const cycleEnd =
      this.currentPeriodEnd ?? new Date(cycleStart.getTime() + 30 * 24 * 60 * 60 * 1000);
    this.currentPeriodStart = cycleStart;
    this.currentPeriodEnd = cycleEnd;
    this.nextBillingAt = this.nextBillingAt ?? cycleEnd;
    this.vipCycleStartedAt = this.vipCycleStartedAt ?? cycleStart;
    this.vipCycleResetAt = this.vipCycleResetAt ?? cycleEnd;
  }

  if (
    this.tier === SubscriptionTier.VIP &&
    this.currentPeriodEnd &&
    this.currentPeriodEnd < new Date() &&
    this.status === 'active'
  ) {
    this.status = 'expired';

    if (this.cancelAtPeriodEnd) {
      const nextTier = this.scheduledTier ?? SubscriptionTier.Standard;
      this.history.push({
        tier: SubscriptionTier.VIP,
        action: 'expired',
        from: SubscriptionTier.VIP,
        to: nextTier,
        changedAt: new Date(),
        note: 'Auto-downgraded on period end',
      });
      this.tier = nextTier;
    }
  }

  next();
});

subscriptionSchema.set('toJSON', {
  virtuals: true,
});

export const Subscription = model<ISubscriptionDocument>('Subscription', subscriptionSchema);
