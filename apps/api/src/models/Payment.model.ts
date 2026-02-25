import { Schema, model, type Document, type Types } from 'mongoose';
import type { PaymentGateway, PaymentStatus, PaymentPurpose } from '@kujuana/shared';

export interface IPaymentDocument extends Document {
  userId: Types.ObjectId;
  subscriptionId?: Types.ObjectId;
  amount: number;
  currency: string;
  gateway: PaymentGateway;
  gatewayRef: string;
  idempotencyKey: string;
  status: PaymentStatus;
  purpose: PaymentPurpose;
  metadata: Record<string, unknown>;
}

const paymentSchema = new Schema<IPaymentDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    subscriptionId: { type: Schema.Types.ObjectId, ref: 'Subscription' },
    amount: { type: Number, required: true },
    currency: { type: String, required: true },
    gateway: { type: String, enum: ['pesapal', 'flutterwave'], required: true },
    gatewayRef: { type: String },
    idempotencyKey: { type: String, required: true, unique: true },
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'refunded'],
      default: 'pending',
    },
    purpose: { type: String, required: true },
    metadata: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true },
);

paymentSchema.index({ userId: 1, status: 1 });
paymentSchema.index({ idempotencyKey: 1 }, { unique: true });
paymentSchema.index({ gatewayRef: 1 });

export const Payment = model<IPaymentDocument>('Payment', paymentSchema);
