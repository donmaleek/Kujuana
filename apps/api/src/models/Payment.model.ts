import { Schema, model, type Document, type Types } from 'mongoose';
import type { PaymentGateway, PaymentStatus, PaymentPurpose } from '@kujuana/shared';
import { randomUUID } from 'crypto';

type LedgerPaymentPurpose =
  | PaymentPurpose
  | 'vip_monthly'
  | 'priority_single'
  | 'priority_bundle_5'
  | 'priority_bundle_10';

const GATEWAY_VALUES: PaymentGateway[] = ['pesapal', 'flutterwave', 'mpesa', 'paystack'];
const STATUS_VALUES: PaymentStatus[] = ['pending', 'completed', 'failed', 'refunded'];
const PURPOSE_VALUES: LedgerPaymentPurpose[] = [
  'subscription_new',
  'subscription_renewal',
  'subscription_upgrade',
  'addon_purchase',
  'credit_topup',
  'vip_monthly',
  'priority_single',
  'priority_bundle_5',
  'priority_bundle_10',
];

const CREDITS_GRANTED: Record<LedgerPaymentPurpose, number> = {
  subscription_new: 0,
  subscription_renewal: 0,
  subscription_upgrade: 0,
  addon_purchase: 0,
  credit_topup: 1,
  vip_monthly: 0,
  priority_single: 1,
  priority_bundle_5: 5,
  priority_bundle_10: 10,
};

export interface IPaymentDocument extends Document {
  userId: Types.ObjectId;
  subscriptionId?: Types.ObjectId;
  reference?: string;
  internalRef: string;
  idempotencyKey: string;
  amount: number;
  currency: string;
  amountInKes?: number;
  gateway: PaymentGateway;
  status: PaymentStatus;
  purpose: LedgerPaymentPurpose;
  creditsGranted: number;
  failureReason?: string;
  phone?: string;
  metadata: Record<string, unknown>;
  webhookReceivedAt?: Date;
  webhookPayload?: Record<string, unknown>;
  completedAt?: Date;
  refundedAt?: Date;
  refundRef?: string;
  isReconciled: boolean;
  reconcileNote?: string;
}

const paymentSchema = new Schema<IPaymentDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    subscriptionId: { type: Schema.Types.ObjectId, ref: 'Subscription' },
    reference: { type: String, unique: true, sparse: true },
    internalRef: { type: String, required: true, unique: true, sparse: true },
    idempotencyKey: { type: String, required: true, unique: true },
    amount: { type: Number, required: true, min: 0 },
    currency: { type: String, required: true, uppercase: true, length: 3 },
    amountInKes: { type: Number, min: 0 },
    gateway: { type: String, enum: GATEWAY_VALUES, required: true },
    status: {
      type: String,
      enum: STATUS_VALUES,
      default: 'pending',
    },
    purpose: { type: String, enum: PURPOSE_VALUES, required: true },
    creditsGranted: { type: Number, default: 0, min: 0 },
    failureReason: { type: String },
    phone: { type: String, match: [/^\+[1-9]\d{7,14}$/, 'Phone must be in E.164 format'] },
    metadata: { type: Schema.Types.Mixed, default: {} },
    webhookReceivedAt: { type: Date },
    webhookPayload: { type: Schema.Types.Mixed, select: false },
    completedAt: { type: Date },
    refundedAt: { type: Date },
    refundRef: { type: String },
    isReconciled: { type: Boolean, default: false },
    reconcileNote: { type: String },
  },
  { timestamps: true, versionKey: false },
);

paymentSchema.index({ userId: 1, createdAt: -1 });
paymentSchema.index({ userId: 1, purpose: 1 });
paymentSchema.index({ status: 1, createdAt: -1 });
paymentSchema.index({ gateway: 1, status: 1 });
paymentSchema.index({ createdAt: -1 });

paymentSchema.pre('save', function setDerivedFields(next) {
  if (!this.internalRef) {
    this.internalRef = `pay_${randomUUID()}`;
  }

  if (this.isNew && !this.creditsGranted && this.purpose) {
    this.creditsGranted = CREDITS_GRANTED[this.purpose] ?? 0;
  }

  if (this.isModified('status') && this.status === 'completed' && !this.completedAt) {
    this.completedAt = new Date();
  }

  if (this.isModified('status') && this.status === 'refunded' && !this.refundedAt) {
    this.refundedAt = new Date();
  }

  next();
});

paymentSchema.set('toJSON', {
  transform: (_doc: unknown, ret: any) => {
    delete ret.webhookPayload;
    delete ret.idempotencyKey;
    return ret;
  },
});

export const Payment = model<IPaymentDocument>('Payment', paymentSchema);
