import { Schema, model, type Document, type Types } from 'mongoose';
import { SubscriptionTier } from '@kujuana/shared';
import type { SubscriptionStatus, TierAddOn } from '@kujuana/shared';

export interface ISubscriptionDocument extends Document {
  userId: Types.ObjectId;
  tier: SubscriptionTier;
  status: SubscriptionStatus;
  credits: number;
  addOns: TierAddOn[];
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
}

const subscriptionSchema = new Schema<ISubscriptionDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    tier: { type: String, enum: Object.values(SubscriptionTier), required: true },
    status: {
      type: String,
      enum: ['active', 'expired', 'cancelled', 'pending_payment'],
      default: 'pending_payment',
    },
    credits: { type: Number, default: 0, min: 0 },
    addOns: { type: [String], default: [] },
    currentPeriodStart: { type: Date, required: true },
    currentPeriodEnd: { type: Date, required: true },
    cancelAtPeriodEnd: { type: Boolean, default: false },
  },
  { timestamps: true },
);

subscriptionSchema.index({ userId: 1, status: 1 });
subscriptionSchema.index({ currentPeriodEnd: 1, status: 1 });

export const Subscription = model<ISubscriptionDocument>('Subscription', subscriptionSchema);
