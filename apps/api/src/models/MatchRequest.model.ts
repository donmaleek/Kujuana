import { Schema, model, type Document, type Types } from 'mongoose';
import { SubscriptionTier } from '@kujuana/shared';

export type MatchRequestStatus =
  | 'queued'
  | 'processing'
  | 'completed'
  | 'failed'
  | 'cancelled'
  | 'no_candidates';

export interface IMatchRequestDocument extends Document {
  userId: Types.ObjectId;
  paymentId?: Types.ObjectId;
  matchId?: Types.ObjectId;
  tier: SubscriptionTier;
  status: MatchRequestStatus;
  bullJobId?: string;
  queueName: string;
  candidatesConsidered?: number;
  candidatesFiltered?: number;
  topScore?: number;
  attempts: number;
  maxAttempts: number;
  lastError?: string;
  queuedAt: Date;
  startedAt?: Date;
  completedAt?: Date;
}

const matchRequestSchema = new Schema<IMatchRequestDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    paymentId: { type: Schema.Types.ObjectId, ref: 'Payment' },
    matchId: { type: Schema.Types.ObjectId, ref: 'Match' },
    tier: { type: String, enum: Object.values(SubscriptionTier), required: true },
    status: {
      type: String,
      enum: ['queued', 'processing', 'completed', 'failed', 'cancelled', 'no_candidates'],
      default: 'queued',
    },
    bullJobId: { type: String },
    queueName: { type: String, default: 'priority-match' },
    candidatesConsidered: { type: Number, min: 0 },
    candidatesFiltered: { type: Number, min: 0 },
    topScore: { type: Number, min: 0, max: 100 },
    attempts: { type: Number, min: 0, default: 0 },
    maxAttempts: { type: Number, min: 1, default: 3 },
    lastError: { type: String, maxlength: 2000 },
    queuedAt: { type: Date, default: Date.now },
    startedAt: { type: Date },
    completedAt: { type: Date },
  },
  { timestamps: true, versionKey: false },
);

matchRequestSchema.index({ userId: 1, status: 1 });
matchRequestSchema.index({ status: 1, tier: 1 });
matchRequestSchema.index({ bullJobId: 1 }, { sparse: true });
matchRequestSchema.index({ createdAt: -1 });
matchRequestSchema.index({ queueName: 1, status: 1, queuedAt: 1 });

export const MatchRequest = model<IMatchRequestDocument>('MatchRequest', matchRequestSchema);
