import { Payment } from '../../models/Payment.model.js';
import { Subscription } from '../../models/Subscription.model.js';
import { User } from '../../models/User.model.js';
import { TIER_CONFIG, SubscriptionTier } from '@kujuana/shared';
import { logger } from '../../config/logger.js';
import mongoose from 'mongoose';
import { emailService } from '../email/email.service.js';

interface PaymentWebhookInput {
  paymentReference: string;
  gateway: 'pesapal' | 'flutterwave' | 'mpesa' | 'paystack';
  gatewayTransactionRef?: string;
  webhookPayload?: Record<string, unknown>;
}

interface PaymentWebhookFailureInput extends PaymentWebhookInput {
  failureReason: string;
}

function buildSearchConditions(input: PaymentWebhookInput): Array<Record<string, unknown>> {
  const reference = input.paymentReference.trim();
  const conditions: Array<Record<string, unknown>> = [
    { internalRef: reference },
    { reference },
    { idempotencyKey: reference },
    { 'metadata.checkoutRequestId': reference },
    { 'metadata.merchantRequestId': reference },
  ];

  if (input.gatewayTransactionRef) {
    conditions.push({ reference: input.gatewayTransactionRef });
    conditions.push({ 'metadata.checkoutRequestId': input.gatewayTransactionRef });
    conditions.push({ 'metadata.merchantRequestId': input.gatewayTransactionRef });
  }
  if (mongoose.Types.ObjectId.isValid(reference)) {
    conditions.push({ _id: reference });
  }

  return conditions;
}

async function findPaymentForWebhook(input: PaymentWebhookInput) {
  return Payment.findOne({
    gateway: input.gateway,
    $or: buildSearchConditions(input),
  });
}

function inferTierFromPayment(payment: {
  metadata: Record<string, unknown>;
  purpose: string;
}): SubscriptionTier {
  const metadataTier = payment.metadata['tier'];
  if (metadataTier === SubscriptionTier.Standard) return SubscriptionTier.Standard;
  if (metadataTier === SubscriptionTier.Priority) return SubscriptionTier.Priority;
  if (metadataTier === SubscriptionTier.VIP) return SubscriptionTier.VIP;

  if (payment.purpose === 'vip_monthly') {
    return SubscriptionTier.VIP;
  }
  if (
    payment.purpose === 'priority_single' ||
    payment.purpose === 'priority_bundle_5' ||
    payment.purpose === 'priority_bundle_10' ||
    payment.purpose === 'credit_topup'
  ) {
    return SubscriptionTier.Priority;
  }

  return SubscriptionTier.Standard;
}

export const webhookService = {
  async handlePaymentSuccess(input: PaymentWebhookInput) {
    const reference = input.paymentReference.trim();
    if (!reference) {
      logger.warn({ gateway: input.gateway }, 'Webhook: missing payment reference');
      return;
    }

    const payment = await findPaymentForWebhook(input);

    if (!payment) {
      logger.warn({ reference, gateway: input.gateway }, 'Webhook: payment not found');
      return;
    }
    if (payment.status === 'completed') {
      await Payment.findByIdAndUpdate(payment._id, {
        webhookReceivedAt: new Date(),
        ...(input.webhookPayload ? { webhookPayload: input.webhookPayload } : {}),
      });
      logger.info({ reference }, 'Webhook: already processed (idempotent)');
      return;
    }

    payment.status = 'completed';
    payment.failureReason = undefined;
    payment.reference = input.gatewayTransactionRef ?? payment.reference ?? reference;
    payment.webhookReceivedAt = new Date();
    payment.webhookPayload = input.webhookPayload;
    await payment.save();

    const tier = inferTierFromPayment(payment);
    const periodStart = new Date();
    const periodEnd = new Date(periodStart);
    periodEnd.setMonth(periodEnd.getMonth() + 1);
    const grantedCredits =
      payment.creditsGranted > 0
        ? payment.creditsGranted
        : (tier === SubscriptionTier.Priority ? TIER_CONFIG[SubscriptionTier.Priority].creditsPerCycle : 0);

    const subscriptionSet: Record<string, unknown> = {
      tier,
      status: 'active',
      cancelAtPeriodEnd: false,
      autoRenew: true,
      lastPaymentId: payment._id,
      lastPaymentAt: new Date(),
    };

    if (tier === SubscriptionTier.VIP) {
      subscriptionSet['currentPeriodStart'] = periodStart;
      subscriptionSet['currentPeriodEnd'] = periodEnd;
      subscriptionSet['nextBillingAt'] = periodEnd;
      subscriptionSet['vipCycleStartedAt'] = periodStart;
      subscriptionSet['vipCycleResetAt'] = periodEnd;
      subscriptionSet['vipMatchesUsedThisCycle'] = 0;
    } else if (tier === SubscriptionTier.Priority) {
      subscriptionSet['currentPeriodStart'] = periodStart;
      subscriptionSet['currentPeriodEnd'] = periodEnd;
      subscriptionSet['nextBillingAt'] = periodEnd;
    }

    const subscriptionUpdate: Record<string, unknown> = {
      $set: subscriptionSet,
      $setOnInsert: { userId: payment.userId, history: [] },
    };

    if (tier === SubscriptionTier.Priority && grantedCredits > 0) {
      subscriptionUpdate['$inc'] = {
        priorityCredits: grantedCredits,
        totalCreditsPurchased: grantedCredits,
      };
    }

    const subscription = await Subscription.findOneAndUpdate(
      { userId: payment.userId },
      subscriptionUpdate,
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );

    if (subscription && !payment.subscriptionId) {
      payment.subscriptionId = subscription._id;
      await payment.save();
    }

    try {
      const user = await User.findById(payment.userId).select('email');
      if (user) {
        await emailService.sendPaymentReceipt(
          user.email,
          payment.amount,
          payment.currency,
          {
            userId: payment.userId.toString(),
            paymentId: payment._id.toString(),
          },
        );
      }
    } catch (err) {
      logger.warn(
        {
          userId: payment.userId.toString(),
          paymentId: payment._id.toString(),
          err,
        },
        'Failed to send payment receipt',
      );
    }

    logger.info({ userId: payment.userId.toString(), tier }, 'Subscription activated');
  },

  async handlePaymentFailure(input: PaymentWebhookFailureInput) {
    const reference = input.paymentReference.trim();
    if (!reference) {
      logger.warn({ gateway: input.gateway }, 'Webhook failure: missing payment reference');
      return;
    }

    const payment = await findPaymentForWebhook(input);
    if (!payment) {
      logger.warn({ reference, gateway: input.gateway }, 'Webhook failure: payment not found');
      return;
    }
    if (payment.status === 'completed') {
      logger.warn(
        { paymentId: payment._id.toString(), gateway: input.gateway },
        'Webhook failure ignored for already-completed payment',
      );
      return;
    }

    payment.status = 'failed';
    payment.failureReason = input.failureReason.slice(0, 500);
    payment.reference = input.gatewayTransactionRef ?? payment.reference;
    payment.webhookReceivedAt = new Date();
    payment.webhookPayload = input.webhookPayload;
    await payment.save();

    logger.info(
      {
        paymentId: payment._id.toString(),
        gateway: input.gateway,
        reason: payment.failureReason,
      },
      'Payment marked failed from webhook',
    );
  },
};
