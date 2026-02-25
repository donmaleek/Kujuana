import { Schema, model, type Document, type Types } from 'mongoose';

export type NotificationChannel = 'push' | 'email' | 'both';
export type NotificationStatus = 'pending' | 'sent' | 'failed' | 'read';

export type NotificationType =
  | 'match_new'
  | 'match_accepted'
  | 'match_declined'
  | 'payment_success'
  | 'payment_failed'
  | 'subscription_expiry'
  | 'welcome'
  | 'email_verified'
  | 'profile_incomplete';

export interface INotificationDocument extends Document {
  userId: Types.ObjectId;
  type: NotificationType;
  channel: NotificationChannel;
  status: NotificationStatus;
  title: string;
  body: string;
  data?: Record<string, unknown>;
  expoPushToken?: string;
  pushTicketId?: string;
  pushReceiptId?: string;
  toEmail?: string;
  resendMessageId?: string;
  relatedMatchId?: Types.ObjectId;
  relatedPaymentId?: Types.ObjectId;
  readAt?: Date;
  sentAt?: Date;
}

const notificationSchema = new Schema<INotificationDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: [
        'match_new',
        'match_accepted',
        'match_declined',
        'payment_success',
        'payment_failed',
        'subscription_expiry',
        'welcome',
        'email_verified',
        'profile_incomplete',
      ],
      required: true,
    },
    channel: {
      type: String,
      enum: ['push', 'email', 'both'],
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'sent', 'failed', 'read'],
      default: 'pending',
    },
    title: { type: String, required: true, trim: true, maxlength: 150 },
    body: { type: String, required: true, trim: true, maxlength: 2000 },
    data: { type: Schema.Types.Mixed },
    expoPushToken: { type: String },
    pushTicketId: { type: String },
    pushReceiptId: { type: String },
    toEmail: { type: String, trim: true, lowercase: true },
    resendMessageId: { type: String },
    relatedMatchId: { type: Schema.Types.ObjectId, ref: 'Match' },
    relatedPaymentId: { type: Schema.Types.ObjectId, ref: 'Payment' },
    readAt: { type: Date },
    sentAt: { type: Date },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

notificationSchema.index({ userId: 1, status: 1 });
notificationSchema.index({ userId: 1, createdAt: -1 });
notificationSchema.index({ status: 1, type: 1 });
notificationSchema.index({ readAt: 1 }, { expireAfterSeconds: 90 * 24 * 60 * 60, sparse: true });

export const Notification = model<INotificationDocument>('Notification', notificationSchema);
