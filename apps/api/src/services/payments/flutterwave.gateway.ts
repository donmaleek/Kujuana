import { createHmac } from 'crypto';
import { env } from '../../config/env.js';
import { logger } from '../../config/logger.js';
import { safeCompare } from '../../utils/security.js';
import { AppError } from '../../middleware/error.middleware.js';

interface FlwInitiateInput {
  paymentReference: string;
  amount: number;
  currency: string;
  userId: string;
  returnUrl?: string;
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

export const flutterwaveGateway = {
  async initiate(input: FlwInitiateInput): Promise<string> {
    const res = await fetch('https://api.flutterwave.com/v3/payments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${env.FLUTTERWAVE_SECRET_KEY}`,
      },
      body: JSON.stringify({
        tx_ref: input.paymentReference,
        amount: input.amount,
        currency: input.currency,
        redirect_url: input.returnUrl ?? env.WEB_BASE_URL + '/subscription?status=return',
        customer: { email: '', name: '' }, // filled post-lookup
        customizations: { title: 'Kujuana', description: 'Matrimonial Subscription' },
      }),
    });
    const data = (await res.json()) as {
      data?: { link?: string };
      message?: string;
      status?: string;
    };
    const link = data.data?.link;
    if (!res.ok || !link) {
      throw new AppError(
        gatewayMessage(data.message, 'Flutterwave did not return a checkout URL'),
        502,
        'PAYMENT_GATEWAY_ERROR',
      );
    }
    logger.info({ paymentReference: input.paymentReference }, 'Flutterwave payment initiated');
    return link;
  },

  verifySignature(payload: string, signature: string): boolean {
    const expected = createHmac('sha256', env.FLUTTERWAVE_WEBHOOK_SECRET)
      .update(payload)
      .digest('hex');
    return signature ? safeCompare(expected, signature) : false;
  },
};
