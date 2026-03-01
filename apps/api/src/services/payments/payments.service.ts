import { createHash, randomUUID } from 'crypto';
import { Payment } from '../../models/Payment.model.js';
import { User } from '../../models/User.model.js';
import { pesapalGateway } from './pesapal.gateway.js';
import { flutterwaveGateway } from './flutterwave.gateway.js';
import { mpesaGateway } from './mpesa.gateway.js';
import { paystackGateway } from './paystack.gateway.js';
import { stripeGateway } from './stripe.gateway.js';
import { AppError } from '../../middleware/error.middleware.js';
import { TIER_CONFIG, SubscriptionTier, normalizePhone, isValidE164 } from '@kujuana/shared';
import type { InitiatePaymentInput, PaymentPurpose } from '@kujuana/shared';
import { webhookService } from './webhook.service.js';
import { env } from '../../config/env.js';
import { logger } from '../../config/logger.js';

const IDEMPOTENCY_WINDOW_MS = 5 * 60 * 1000;

type PaymentRequestInput = InitiatePaymentInput & {
  purpose?: PaymentPurpose;
  phone?: string;
};

type PurposePricingConfig = {
  tier: InitiatePaymentInput['tier'];
  amount: Record<InitiatePaymentInput['currency'], number>;
  creditsGranted: number;
};

type GatewayInitiationResult = {
  checkoutUrl?: string;
  metadata?: Record<string, unknown>;
  message?: string;
  phone?: string;
};

const PURPOSE_PRICING: Partial<Record<PaymentPurpose, PurposePricingConfig>> = {
  priority_single: {
    tier: SubscriptionTier.Priority,
    amount: { KES: 500, USD: 4 },
    creditsGranted: 1,
  },
  priority_bundle_5: {
    tier: SubscriptionTier.Priority,
    amount: { KES: 2000, USD: 16 },
    creditsGranted: 5,
  },
  priority_bundle_10: {
    tier: SubscriptionTier.Priority,
    amount: { KES: 3500, USD: 28 },
    creditsGranted: 10,
  },
  vip_monthly: {
    tier: SubscriptionTier.VIP,
    amount: { KES: 10000, USD: 75 },
    creditsGranted: 0,
  },
};

function buildIdempotencyKey(userId: string, purpose: string): string {
  const bucket = Math.floor(Date.now() / IDEMPOTENCY_WINDOW_MS);
  return createHash('sha256')
    .update(`${userId}:${purpose}:${bucket}`)
    .digest('hex');
}

function normalizeToE164(rawPhone: string): string {
  const normalized = normalizePhone(rawPhone);
  if (!isValidE164(normalized)) {
    throw new AppError(
      'Phone number must be in E.164 format (e.g. +2547XXXXXXXX).',
      400,
      'INVALID_PHONE_NUMBER',
    );
  }
  return normalized;
}

async function initiateGateway(input: {
  gateway: InitiatePaymentInput['gateway'];
  paymentReference: string;
  amount: number;
  currency: string;
  userId: string;
  returnUrl?: string;
  phone?: string;
  email?: string;
}): Promise<GatewayInitiationResult> {
  if (input.gateway === 'pesapal') {
    const checkoutUrl = await pesapalGateway.initiate({
      paymentReference: input.paymentReference,
      amount: input.amount,
      currency: input.currency,
      userId: input.userId,
      returnUrl: input.returnUrl,
    });
    return { checkoutUrl };
  }

  if (input.gateway === 'flutterwave') {
    const checkoutUrl = await flutterwaveGateway.initiate({
      paymentReference: input.paymentReference,
      amount: input.amount,
      currency: input.currency,
      userId: input.userId,
      returnUrl: input.returnUrl,
    });
    return { checkoutUrl };
  }

  if (input.gateway === 'paystack') {
    if (!input.email) {
      throw new AppError('Email is required for Paystack checkout.', 400, 'EMAIL_REQUIRED');
    }
    const checkoutUrl = await paystackGateway.initiate({
      paymentReference: input.paymentReference,
      amount: input.amount,
      currency: input.currency,
      email: input.email,
      returnUrl: input.returnUrl,
    });
    return { checkoutUrl };
  }

  if (input.gateway === 'stripe') {
    const returnBase = input.returnUrl ?? `${env.WEB_BASE_URL}/subscription`;
    const checkoutUrl = await stripeGateway.initiate({
      paymentReference: input.paymentReference,
      amount: input.amount,
      currency: input.currency,
      email: input.email,
      successUrl: `${returnBase}?status=return&ref=${input.paymentReference}`,
      cancelUrl: `${returnBase}?status=cancelled`,
    });
    return { checkoutUrl };
  }

  if (!input.phone) {
    throw new AppError('Phone number is required for M-Pesa STK push.', 400, 'PHONE_REQUIRED');
  }

  const mpesaResult = await mpesaGateway.initiate({
    paymentReference: input.paymentReference,
    amount: input.amount,
    currency: input.currency,
    phone: input.phone,
  });

  return {
    message: mpesaResult.customerMessage ?? mpesaResult.responseDescription,
    phone: mpesaResult.phoneE164,
    metadata: {
      checkoutRequestId: mpesaResult.checkoutRequestId,
      merchantRequestId: mpesaResult.merchantRequestId,
      mpesaPhone: mpesaResult.phoneDaraja,
      responseDescription: mpesaResult.responseDescription,
      customerMessage: mpesaResult.customerMessage,
      initiatedAt: new Date().toISOString(),
    },
  };
}

export const paymentsService = {
  async initiatePayment(userId: string, input: PaymentRequestInput) {
    const purpose: PaymentPurpose = input.purpose ?? 'subscription_new';
    const purposePricing = PURPOSE_PRICING[purpose];
    const resolvedTier = purposePricing?.tier ?? input.tier;
    const fallbackTierConfig = TIER_CONFIG[resolvedTier];
    const amount = purposePricing?.amount[input.currency] ?? fallbackTierConfig.price[input.currency];
    if (!amount || amount <= 0) {
      throw new AppError(`Unsupported currency for purpose: ${purpose}/${input.currency}`, 400);
    }
    if (input.gateway === 'mpesa' && input.currency !== 'KES') {
      throw new AppError('M-Pesa payments must use KES.', 400, 'INVALID_PAYMENT_CURRENCY');
    }

    let resolvedPhone =
      typeof input.phone === 'string' && input.phone.trim()
        ? normalizeToE164(input.phone.trim())
        : undefined;
    let resolvedEmail: string | undefined;

    if (input.gateway === 'mpesa' || input.gateway === 'paystack' || input.gateway === 'stripe') {
      const user = await User.findById(userId).select('phone email');
      if (!user) {
        throw new AppError('User not found.', 404, 'USER_NOT_FOUND');
      }
      resolvedEmail = user.email;

      if (input.gateway === 'mpesa' && !resolvedPhone) {
        if (!user.phone) {
          throw new AppError(
            'No phone number found on your account. Add a phone number to continue with M-Pesa.',
            400,
            'PHONE_REQUIRED',
          );
        }
        resolvedPhone = normalizeToE164(user.phone);
      }
    }

    const creditsGranted =
      purposePricing?.creditsGranted ??
      (resolvedTier === SubscriptionTier.Priority ? fallbackTierConfig.creditsPerCycle : 0);
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
        existingByIdempotency.gateway = input.gateway;
        existingByIdempotency.currency = input.currency;
        existingByIdempotency.amount = amount;
        existingByIdempotency.amountInKes = input.currency === 'KES' ? amount : undefined;
        existingByIdempotency.status = 'pending';
        existingByIdempotency.failureReason = undefined;
        if (resolvedPhone) existingByIdempotency.phone = resolvedPhone;
        existingByIdempotency.metadata = {
          tier: resolvedTier,
          purpose,
        };
        await existingByIdempotency.save();
      }

      const existingCheckout =
        typeof existingByIdempotency.metadata['checkoutUrl'] === 'string'
          ? existingByIdempotency.metadata['checkoutUrl']
          : undefined;
      const existingStkRequestId =
        typeof existingByIdempotency.metadata['checkoutRequestId'] === 'string'
          ? existingByIdempotency.metadata['checkoutRequestId']
          : undefined;

      if (existingCheckout) {
        return {
          paymentId: existingByIdempotency._id.toString(),
          paymentReference: existingByIdempotency.internalRef,
          checkoutUrl: existingCheckout,
          reused: true,
        };
      }

      if (input.gateway === 'mpesa' && existingStkRequestId && existingByIdempotency.status === 'pending') {
        return {
          paymentId: existingByIdempotency._id.toString(),
          paymentReference: existingByIdempotency.internalRef,
          checkoutUrl: undefined,
          reused: true,
          message: 'M-Pesa prompt is already active. Complete the prompt on your phone.',
        };
      }

      if (existingByIdempotency.status === 'failed') {
        existingByIdempotency.status = 'pending';
        existingByIdempotency.failureReason = undefined;
        if (resolvedPhone) existingByIdempotency.phone = resolvedPhone;
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
            creditsGranted,
            phone: resolvedPhone,
            metadata: { tier: resolvedTier, purpose },
          },
        },
        { new: true, upsert: true, setDefaultsOnInsert: true },
      );
    }

    if (!payment) {
      throw new AppError('Failed to initialize payment', 500);
    }

    let gatewayResult: GatewayInitiationResult;
    try {
      gatewayResult = await initiateGateway({
        gateway: input.gateway,
        paymentReference: payment.internalRef,
        amount,
        currency: input.currency,
        userId,
        returnUrl: input.returnUrl,
        phone: resolvedPhone,
        email: resolvedEmail,
      });
    } catch (err) {
      const reason = err instanceof Error ? err.message : 'Payment gateway initiation failed';
      const canSimulate = env.NODE_ENV !== 'production' && env.PAYMENT_SIMULATION_ENABLED;

      if (canSimulate) {
        logger.warn(
          {
            userId,
            paymentReference: payment.internalRef,
            gateway: input.gateway,
            reason,
          },
          'Payment gateway initiation failed in non-production; simulating payment success',
        );

        await webhookService.handlePaymentSuccess({
          paymentReference: payment.internalRef,
          gateway: input.gateway,
          gatewayTransactionRef: `dev-sim-${Date.now()}`,
          webhookPayload: {
            simulated: true,
            reason,
            mode: 'development_fallback',
          },
        });

        return {
          paymentId: payment._id.toString(),
          paymentReference: payment.internalRef,
          checkoutUrl: undefined,
          reused: false,
          simulated: true,
        };
      }

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

    payment =
      (await Payment.findByIdAndUpdate(
        payment._id,
        {
          $set: {
            phone: gatewayResult.phone ?? resolvedPhone,
            metadata: {
              ...(payment.metadata ?? {}),
              tier: resolvedTier,
              purpose,
              ...(gatewayResult.metadata ?? {}),
              ...(gatewayResult.checkoutUrl ? { checkoutUrl: gatewayResult.checkoutUrl } : {}),
            },
          },
        },
        { new: true },
      )) ?? payment;

    if (!payment) {
      throw new AppError('Failed to persist payment initialization', 500);
    }

    return {
      paymentId: payment._id.toString(),
      paymentReference: payment.internalRef,
      checkoutUrl: gatewayResult.checkoutUrl,
      reused: false,
      message: gatewayResult.message,
    };
  },
};
