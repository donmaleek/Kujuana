import { Schema, model, type Document } from 'mongoose';
import type { IUser, UserRole } from '@kujuana/shared';

export interface IUserDocument extends Omit<IUser, '_id'>, Document {}

const userSchema = new Schema<IUserDocument>(
  {
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    roles: { type: [String], default: ['member'] },
    isEmailVerified: { type: Boolean, default: false },
    isPhoneVerified: { type: Boolean, default: false },
    isSuspended: { type: Boolean, default: false },
    suspensionReason: { type: String },
  },
  { timestamps: true },
);

userSchema.index({ email: 1 });
userSchema.index({ phone: 1 });
userSchema.index({ roles: 1 });

export const User = model<IUserDocument>('User', userSchema);
