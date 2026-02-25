import { randomUUID } from 'crypto';
import { Payment } from '../../models/Payment.model.js';
import { Subscription } from '../../models/Subscription.model.js';
import { pesapalGateway } from './pesapal.gateway.js';
import { flutterwaveGateway } from './flutterwave.gateway.js';
import { AppError } from '../../middleware/error.middleware.js';
import { TIER_CONFIG, SubscriptionTier } from '@kujuana/shared';
import type { InitiatePaymentInput } from '@kujuana/shared';

export const paymentsService = {
  async initiatePayment(userId: string, input: InitiatePaymentInput) {
    const tierConfig = TIER_CONFIG[input.tier];
    const amount = input.currency === 'KES' ? tierConfig.price.KES : tierConfig.price.USD;
    const idempotencyKey = randomUUID();

    const payment = await Payment.create({
      userId,
      amount,
      currency: input.currency,
      gateway: input.gateway,
      idempotencyKey,
      status: 'pending',
      purpose: 'subscription_new',
    });

    let checkoutUrl: string;
    if (input.gateway === 'pesapal') {
      checkoutUrl = await pesapalGateway.initiate({
        paymentId: payment._id.toString(),
        amount,
        currency: input.currency,
        userId,
        returnUrl: input.returnUrl,
      });
    } else {
      checkoutUrl = await flutterwaveGateway.initiate({
        paymentId: payment._id.toString(),
        amount,
        currency: input.currency,
        userId,
        returnUrl: input.returnUrl,
      });
    }

    return { paymentId: payment._id.toString(), checkoutUrl };
  },
};
