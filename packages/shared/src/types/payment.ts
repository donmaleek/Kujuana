export interface IPayment {
  _id: string;
  userId: string;
  subscriptionId?: string;
  amount: number;
  currency: string;
  gateway: PaymentGateway;
  gatewayRef: string;
  idempotencyKey: string;
  status: PaymentStatus;
  purpose: PaymentPurpose;
  metadata: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export type PaymentGateway = 'pesapal' | 'flutterwave';
export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded';
export type PaymentPurpose =
  | 'subscription_new'
  | 'subscription_renewal'
  | 'subscription_upgrade'
  | 'addon_purchase'
  | 'credit_topup';
