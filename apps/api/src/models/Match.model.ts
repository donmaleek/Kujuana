import { Schema, model, type Document, type Types } from 'mongoose';
import { SubscriptionTier } from '@kujuana/shared';
import type { MatchStatus, MatchAction, IScoreBreakdown } from '@kujuana/shared';

export interface IMatchDocument extends Document {
  userId: Types.ObjectId;
  matchedUserId: Types.ObjectId;
  score: number;
  scoreBreakdown: IScoreBreakdown;
  tier: SubscriptionTier;
  status: MatchStatus;
  userAction: MatchAction;
  matchedUserAction: MatchAction;
  introductionNote?: string;
  expiresAt?: Date;
}

const matchSchema = new Schema<IMatchDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    matchedUserId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    score: { type: Number, required: true, min: 0, max: 100 },
    scoreBreakdown: { type: Schema.Types.Mixed, required: true },
    tier: { type: String, enum: Object.values(SubscriptionTier), required: true },
    status: {
      type: String,
      enum: ['pending', 'active', 'accepted', 'declined', 'expired'],
      default: 'pending',
    },
    userAction: { type: String, enum: ['accepted', 'declined', 'pending'], default: 'pending' },
    matchedUserAction: {
      type: String,
      enum: ['accepted', 'declined', 'pending'],
      default: 'pending',
    },
    introductionNote: { type: String },
    expiresAt: { type: Date },
  },
  { timestamps: true },
);

matchSchema.index({ userId: 1, status: 1, createdAt: -1 });
matchSchema.index({ matchedUserId: 1, status: 1 });
matchSchema.index({ userId: 1, matchedUserId: 1 }, { unique: true });
matchSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const Match = model<IMatchDocument>('Match', matchSchema);
