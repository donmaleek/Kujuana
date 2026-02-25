import { Schema, model, type Document, type Types } from 'mongoose';

export interface IDeviceSessionDocument extends Document {
  userId: Types.ObjectId;
  refreshTokenHash: string;
  deviceId: string;
  deviceName?: string;
  ipAddress?: string;
  userAgent?: string;
  isRevoked: boolean;
  expiresAt: Date;
  lastUsedAt: Date;
}

const deviceSessionSchema = new Schema<IDeviceSessionDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    refreshTokenHash: { type: String, required: true },
    deviceId: { type: String, required: true },
    deviceName: { type: String },
    ipAddress: { type: String },
    userAgent: { type: String },
    isRevoked: { type: Boolean, default: false },
    expiresAt: { type: Date, required: true },
    lastUsedAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

deviceSessionSchema.index({ userId: 1, isRevoked: 1 });
deviceSessionSchema.index({ refreshTokenHash: 1 });
deviceSessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const DeviceSession = model<IDeviceSessionDocument>('DeviceSession', deviceSessionSchema);
