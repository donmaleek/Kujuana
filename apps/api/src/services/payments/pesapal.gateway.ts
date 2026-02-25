import { env } from '../../config/env.js';
import { logger } from '../../config/logger.js';

interface PesapalInitiateInput {
  paymentId: string;
  amount: number;
  currency: string;
  userId: string;
  returnUrl?: string;
}

const BASE_URL =
  env.PESAPAL_ENV === 'live'
    ? 'https://pay.pesapal.com/v3'
    : 'https://cybqa.pesapal.com/pesapalv3';

export const pesapalGateway = {
  async getToken(): Promise<string> {
    const res = await fetch(`${BASE_URL}/api/Auth/RequestToken`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        consumer_key: env.PESAPAL_CONSUMER_KEY,
        consumer_secret: env.PESAPAL_CONSUMER_SECRET,
      }),
    });
    const data = (await res.json()) as { token: string };
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
        id: input.paymentId,
        currency: input.currency,
        amount: input.amount,
        description: 'Kujuana Subscription',
        callback_url: input.returnUrl ?? env.WEB_BASE_URL + '/subscription?status=return',
        notification_id: env.PESAPAL_IPN_URL,
        billing_address: { email_address: '' }, // filled by gateway
      }),
    });
    const data = (await res.json()) as { redirect_url: string };
    logger.info({ paymentId: input.paymentId }, 'Pesapal order submitted');
    return data.redirect_url;
  },

  verifySignature(payload: string, signature: string): boolean {
    // Pesapal uses HMAC-SHA256
    const { createHmac } = require('crypto') as typeof import('crypto');
    const expected = createHmac('sha256', env.PESAPAL_CONSUMER_SECRET)
      .update(payload)
      .digest('base64');
    return expected === signature;
  },
};
