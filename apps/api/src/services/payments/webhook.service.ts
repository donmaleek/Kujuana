import { Payment } from '../../models/Payment.model.js';
import { Subscription } from '../../models/Subscription.model.js';
import { TIER_CONFIG, SubscriptionTier } from '@kujuana/shared';
import { logger } from '../../config/logger.js';

export const webhookService = {
  async handlePaymentSuccess(gatewayRef: string, gateway: 'pesapal' | 'flutterwave') {
    const payment = await Payment.findOne({ idempotencyKey: gatewayRef });
    if (!payment) {
      logger.warn({ gatewayRef }, 'Webhook: payment not found');
      return;
    }
    if (payment.status === 'completed') {
      logger.info({ gatewayRef }, 'Webhook: already processed (idempotent)');
      return;
    }

    payment.status = 'completed';
    payment.gatewayRef = gatewayRef;
    await payment.save();

    // Determine tier from payment metadata or amount
    const tier = (payment.metadata['tier'] as SubscriptionTier) ?? SubscriptionTier.Standard;
    const periodStart = new Date();
    const periodEnd = new Date(periodStart);
    periodEnd.setMonth(periodEnd.getMonth() + 1);

    await Subscription.findOneAndUpdate(
      { userId: payment.userId },
      {
        tier,
        status: 'active',
        credits: TIER_CONFIG[tier].creditsPerCycle,
        currentPeriodStart: periodStart,
        currentPeriodEnd: periodEnd,
        cancelAtPeriodEnd: false,
      },
      { upsert: true, new: true },
    );

    logger.info({ userId: payment.userId.toString(), tier }, 'Subscription activated');
  },
};
