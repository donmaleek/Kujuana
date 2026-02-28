import { createHmac } from 'crypto';
import { env } from '../../config/env.js';
import { logger } from '../../config/logger.js';
import { AppError } from '../../middleware/error.middleware.js';
import { safeCompare } from '../../utils/security.js';
import { assertGatewayConfigured } from './gateway-config.js';

interface PaystackInitiateInput {
  paymentReference: string;
  amount: number;
  currency: string;
  email: string;
  returnUrl?: string;
}

interface PaystackInitializeResponse {
  status?: boolean;
  message?: string;
  data?: {
    authorization_url?: string;
    reference?: string;
    access_code?: string;
  };
}

function gatewayMessage(value: unknown, fallback: string): string {
  if (typeof value === 'string' && value.trim()) return value;
  if (value && typeof value === 'object') {
    const nestedMessage = (value as Record<string, unknown>)['message'];
    if (typeof nestedMessage === 'string' && nestedMessage.trim()) return nestedMessage;
    try {
      return JSON.stringify(value);
    } catch {
      return fallback;
    }
  }
  return fallback;
}

function toSmallestUnit(amount: number): number {
  return Math.max(1, Math.round(amount * 100));
}

export const paystackGateway = {
  async initiate(input: PaystackInitiateInput): Promise<string> {
    assertGatewayConfigured('Paystack', {
      PAYSTACK_SECRET_KEY: env.PAYSTACK_SECRET_KEY,
      PAYSTACK_PUBLIC_KEY: env.PAYSTACK_PUBLIC_KEY,
      PAYSTACK_CALLBACK_URL: env.PAYSTACK_CALLBACK_URL,
    });

    const res = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${env.PAYSTACK_SECRET_KEY}`,
      },
      body: JSON.stringify({
        email: input.email,
        amount: toSmallestUnit(input.amount),
        currency: input.currency,
        reference: input.paymentReference,
        callback_url: input.returnUrl ?? env.PAYSTACK_CALLBACK_URL,
        metadata: {
          paymentReference: input.paymentReference,
        },
      }),
    });

    const data = (await res.json().catch(() => ({}))) as PaystackInitializeResponse;
    const checkoutUrl = data.data?.authorization_url;
    if (!res.ok || !data.status || !checkoutUrl) {
      throw new AppError(
        gatewayMessage(data.message, 'Paystack did not return a checkout URL'),
        502,
        'PAYMENT_GATEWAY_ERROR',
      );
    }

    logger.info({ paymentReference: input.paymentReference }, 'Paystack payment initialized');
    return checkoutUrl;
  },

  verifySignature(payload: string, signature: string): boolean {
    if (!signature) return false;
    const expected = createHmac('sha512', env.PAYSTACK_SECRET_KEY).update(payload).digest('hex');
    return safeCompare(expected, signature);
  },
};

