import { Schema, model, type Document, type Types } from 'mongoose';

export interface IMatchRequestDocument extends Document {
  userId: Types.ObjectId;
  tier: 'priority' | 'vip';
  status: 'queued' | 'processing' | 'completed' | 'failed';
  jobId?: string;
  resultMatchId?: Types.ObjectId;
  requestedAt: Date;
  completedAt?: Date;
}

const matchRequestSchema = new Schema<IMatchRequestDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    tier: { type: String, enum: ['priority', 'vip'], required: true },
    status: {
      type: String,
      enum: ['queued', 'processing', 'completed', 'failed'],
      default: 'queued',
    },
    jobId: { type: String },
    resultMatchId: { type: Schema.Types.ObjectId, ref: 'Match' },
    requestedAt: { type: Date, default: Date.now },
    completedAt: { type: Date },
  },
  { timestamps: true },
);

matchRequestSchema.index({ userId: 1, status: 1 });
matchRequestSchema.index({ status: 1, requestedAt: 1 });

export const MatchRequest = model<IMatchRequestDocument>('MatchRequest', matchRequestSchema);
