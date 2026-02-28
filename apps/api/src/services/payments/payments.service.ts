import { createHash, randomUUID } from 'crypto';
import { Payment } from '../../models/Payment.model.js';
import { pesapalGateway } from './pesapal.gateway.js';
import { flutterwaveGateway } from './flutterwave.gateway.js';
import { AppError } from '../../middleware/error.middleware.js';
import { TIER_CONFIG } from '@kujuana/shared';
import type { InitiatePaymentInput } from '@kujuana/shared';

const IDEMPOTENCY_WINDOW_MS = 5 * 60 * 1000;

function buildIdempotencyKey(userId: string, purpose: string): string {
  const bucket = Math.floor(Date.now() / IDEMPOTENCY_WINDOW_MS);
  return createHash('sha256')
    .update(`${userId}:${purpose}:${bucket}`)
    .digest('hex');
}

async function initiateGateway(input: {
  gateway: InitiatePaymentInput['gateway'];
  paymentReference: string;
  amount: number;
  currency: string;
  userId: string;
  returnUrl?: string;
}): Promise<string> {
  if (input.gateway === 'pesapal') {
    return pesapalGateway.initiate({
      paymentReference: input.paymentReference,
      amount: input.amount,
      currency: input.currency,
      userId: input.userId,
      returnUrl: input.returnUrl,
    });
  }

  return flutterwaveGateway.initiate({
    paymentReference: input.paymentReference,
    amount: input.amount,
    currency: input.currency,
    userId: input.userId,
    returnUrl: input.returnUrl,
  });
}

export const paymentsService = {
  async initiatePayment(userId: string, input: InitiatePaymentInput) {
    const tierConfig = TIER_CONFIG[input.tier];
    const amount = tierConfig.price[input.currency as keyof typeof tierConfig.price];
    if (!amount) {
      throw new AppError(`Unsupported currency for tier: ${input.currency}`, 400);
    }

    const purpose = 'subscription_new';
    const idempotencyKey = buildIdempotencyKey(userId, purpose);

    const existingByIdempotency = await Payment.findOne({ userId, idempotencyKey });
    if (
      existingByIdempotency &&
      ['completed', 'refunded'].includes(existingByIdempotency.status)
    ) {
      throw new AppError(
        'A payment was already initiated recently. Please wait a few minutes before retrying.',
        409,
      );
    }

    if (existingByIdempotency) {
      if (
        existingByIdempotency.gateway !== input.gateway ||
        existingByIdempotency.currency !== input.currency ||
        existingByIdempotency.amount !== amount
      ) {
        throw new AppError(
          'A payment is already pending in this 5-minute window with different parameters.',
          409,
        );
      }

      const existingCheckout =
        typeof existingByIdempotency.metadata['checkoutUrl'] === 'string'
          ? existingByIdempotency.metadata['checkoutUrl']
          : undefined;
      if (existingCheckout) {
        return {
          paymentId: existingByIdempotency._id.toString(),
          paymentReference: existingByIdempotency.internalRef,
          checkoutUrl: existingCheckout,
          reused: true,
        };
      }

      if (existingByIdempotency.status === 'failed') {
        existingByIdempotency.status = 'pending';
        existingByIdempotency.failureReason = undefined;
        await existingByIdempotency.save();
      }
    }

    let payment = existingByIdempotency;
    if (!payment) {
      const internalRef = `pay_${randomUUID()}`;
      payment = await Payment.findOneAndUpdate(
        { userId, idempotencyKey, status: 'pending' },
        {
          $setOnInsert: {
            userId,
            amount,
            amountInKes: input.currency === 'KES' ? amount : undefined,
            currency: input.currency,
            gateway: input.gateway,
            internalRef,
            idempotencyKey,
            status: 'pending',
            purpose,
            metadata: { tier: input.tier },
          },
        },
        { new: true, upsert: true, setDefaultsOnInsert: true },
      );
    }

    if (!payment) {
      throw new AppError('Failed to initialize payment', 500);
    }

    let checkoutUrl: string;
    try {
      checkoutUrl = await initiateGateway({
        gateway: input.gateway,
        paymentReference: payment.internalRef,
        amount,
        currency: input.currency,
        userId,
        returnUrl: input.returnUrl,
      });
    } catch (err) {
      const reason = err instanceof Error ? err.message : 'Payment gateway initiation failed';
      await Payment.findByIdAndUpdate(payment._id, {
        status: 'failed',
        failureReason: reason.slice(0, 500),
      });
      if (err instanceof AppError) {
        throw new AppError(
          `${err.message} (reference: ${payment.internalRef})`,
          err.statusCode,
          err.code ?? 'PAYMENT_GATEWAY_ERROR',
        );
      }
      throw new AppError(
        `Payment gateway initiation failed (reference: ${payment.internalRef})`,
        502,
        'PAYMENT_GATEWAY_ERROR',
      );
    }

    payment = await Payment.findByIdAndUpdate(
      payment._id,
      {
        $set: {
          metadata: {
            ...(payment.metadata ?? {}),
            tier: input.tier,
            checkoutUrl,
          },
        },
      },
      { new: true },
    ) ?? payment;

    if (!payment) {
      throw new AppError('Failed to persist payment initialization', 500);
    }

    return {
      paymentId: payment._id.toString(),
      paymentReference: payment.internalRef,
      checkoutUrl,
      reused: false,
    };
  },
};
