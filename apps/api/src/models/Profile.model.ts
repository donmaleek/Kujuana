import { Schema, model, type Document, type Types } from 'mongoose';

export interface IProfileDocument extends Document {
  userId: Types.ObjectId;
  basic: Record<string, unknown>;
  background: Record<string, unknown>;
  photos: Array<{ publicId: string; isPrivate: boolean; order: number }>;
  vision: Record<string, unknown>;
  preferences: Record<string, unknown>;
  completeness: {
    basic: boolean;
    background: boolean;
    photos: boolean;
    vision: boolean;
    preferences: boolean;
    overall: number;
  };
  isSubmitted: boolean;
  submittedAt?: Date;
}

const profileSchema = new Schema<IProfileDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    basic: { type: Schema.Types.Mixed, default: {} },
    background: { type: Schema.Types.Mixed, default: {} },
    photos: [
      {
        publicId: { type: String, required: true },
        isPrivate: { type: Boolean, default: true },
        order: { type: Number, required: true },
      },
    ],
    vision: { type: Schema.Types.Mixed, default: {} },
    preferences: { type: Schema.Types.Mixed, default: {} },
    completeness: {
      basic: { type: Boolean, default: false },
      background: { type: Boolean, default: false },
      photos: { type: Boolean, default: false },
      vision: { type: Boolean, default: false },
      preferences: { type: Boolean, default: false },
      overall: { type: Number, default: 0 },
    },
    isSubmitted: { type: Boolean, default: false },
    submittedAt: { type: Date },
  },
  { timestamps: true },
);

profileSchema.index({ userId: 1 });
profileSchema.index({ 'basic.country': 1, 'basic.gender': 1 });
profileSchema.index({ isSubmitted: 1, 'completeness.overall': -1 });

export const Profile = model<IProfileDocument>('Profile', profileSchema);
