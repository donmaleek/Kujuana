export interface IPayment {
  _id: string;
  userId: string;
  subscriptionId?: string;
  reference?: string;
  internalRef: string;
  amount: number;
  currency: string;
  amountInKes?: number;
  gateway: PaymentGateway;
  gatewayRef?: string; // legacy field
  idempotencyKey: string;
  status: PaymentStatus;
  purpose: PaymentPurpose;
  creditsGranted?: number;
  failureReason?: string;
  webhookReceivedAt?: Date;
  completedAt?: Date;
  refundedAt?: Date;
  metadata: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export type PaymentGateway = 'pesapal' | 'flutterwave' | 'mpesa' | 'paystack';
export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded';
export type PaymentPurpose =
  | 'subscription_new'
  | 'subscription_renewal'
  | 'subscription_upgrade'
  | 'addon_purchase'
  | 'credit_topup'
  | 'vip_monthly'
  | 'priority_single'
  | 'priority_bundle_5'
  | 'priority_bundle_10';
