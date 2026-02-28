import { env } from '../../config/env.js';
import { logger } from '../../config/logger.js';
import { safeCompare } from '../../utils/security.js';
import { createHmac } from 'crypto';
import { AppError } from '../../middleware/error.middleware.js';
import { assertGatewayConfigured } from './gateway-config.js';

interface PesapalInitiateInput {
  paymentReference: string;
  amount: number;
  currency: string;
  userId: string;
  returnUrl?: string;
}

const BASE_URL =
  env.PESAPAL_ENV === 'live'
    ? 'https://pay.pesapal.com/v3'
    : 'https://cybqa.pesapal.com/pesapalv3';

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

export const pesapalGateway = {
  async getToken(): Promise<string> {
    assertGatewayConfigured('Pesapal', {
      PESAPAL_CONSUMER_KEY: env.PESAPAL_CONSUMER_KEY,
      PESAPAL_CONSUMER_SECRET: env.PESAPAL_CONSUMER_SECRET,
      PESAPAL_IPN_URL: env.PESAPAL_IPN_URL,
    });

    const res = await fetch(`${BASE_URL}/api/Auth/RequestToken`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        consumer_key: env.PESAPAL_CONSUMER_KEY,
        consumer_secret: env.PESAPAL_CONSUMER_SECRET,
      }),
    });
    const data = (await res.json()) as { token?: string; message?: string; error?: string };
    if (!res.ok || !data.token) {
      throw new AppError(gatewayMessage(data.message ?? data.error, 'Pesapal token request failed'), 502, 'PAYMENT_GATEWAY_ERROR');
    }
    return data.token;
  },

  async initiate(input: PesapalInitiateInput): Promise<string> {
    const token = await this.getToken();
    const res = await fetch(`${BASE_URL}/api/Transactions/SubmitOrderRequest`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        id: input.paymentReference,
        currency: input.currency,
        amount: input.amount,
        description: 'Kujuana Subscription',
        callback_url: input.returnUrl ?? env.WEB_BASE_URL + '/subscription?status=return',
        notification_id: env.PESAPAL_IPN_URL,
        billing_address: { email_address: '' }, // filled by gateway
      }),
    });
    const data = (await res.json()) as {
      redirect_url?: string;
      redirectUrl?: string;
      message?: string;
      error?: string;
    };
    const redirectUrl = data.redirect_url ?? data.redirectUrl;
    if (!res.ok || !redirectUrl) {
      throw new AppError(
        gatewayMessage(data.message ?? data.error, 'Pesapal did not return a checkout URL'),
        502,
        'PAYMENT_GATEWAY_ERROR',
      );
    }
    logger.info({ paymentReference: input.paymentReference }, 'Pesapal order submitted');
    return redirectUrl;
  },

  verifySignature(payload: string, signature: string): boolean {
    // Pesapal uses HMAC-SHA256
    const expected = createHmac('sha256', env.PESAPAL_CONSUMER_SECRET)
      .update(payload)
      .digest('base64');
    return signature ? safeCompare(expected, signature) : false;
  },
};
