import { createHmac, timingSafeEqual } from 'crypto';
import { env } from '../../config/env.js';
import { logger } from '../../config/logger.js';
import { AppError } from '../../middleware/error.middleware.js';
import { assertGatewayConfigured } from './gateway-config.js';

const STRIPE_API = 'https://api.stripe.com/v1';

// Stripe uses zero-decimal amounts for currencies like KES.
// For USD (decimal), multiply by 100. For KES (zero-decimal), use as-is.
const ZERO_DECIMAL_CURRENCIES = new Set(['KES', 'JPY', 'KRW', 'VND', 'BIF', 'CLP', 'GNF', 'MGA', 'PYG', 'RWF', 'UGX', 'XAF', 'XOF']);

function toStripeAmount(amount: number, currency: string): number {
  return ZERO_DECIMAL_CURRENCIES.has(currency.toUpperCase()) ? Math.round(amount) : Math.round(amount * 100);
}

interface StripeInitiateInput {
  paymentReference: string;
  amount: number;
  currency: string;
  email?: string;
  successUrl: string;
  cancelUrl: string;
}

export interface StripeWebhookEvent {
  type: string;
  data: {
    object: {
      id: string;
      payment_status: string;
      payment_intent: string;
      metadata: Record<string, string>;
      amount_total: number;
      currency: string;
    };
  };
}

export const stripeGateway = {
  async initiate(input: StripeInitiateInput): Promise<string> {
    assertGatewayConfigured('Stripe', {
      STRIPE_SECRET_KEY: env.STRIPE_SECRET_KEY,
      STRIPE_WEBHOOK_SECRET: env.STRIPE_WEBHOOK_SECRET,
    });

    // Build form-encoded body (Stripe API uses application/x-www-form-urlencoded)
    const params = new URLSearchParams({
      'payment_method_types[]': 'card',
      'line_items[0][quantity]': '1',
      'line_items[0][price_data][currency]': input.currency.toLowerCase(),
      'line_items[0][price_data][unit_amount]': String(toStripeAmount(input.amount, input.currency)),
      'line_items[0][price_data][product_data][name]': 'Kujuana Membership',
      'line_items[0][price_data][product_data][description]': 'Premium intentional dating',
      mode: 'payment',
      success_url: input.successUrl,
      cancel_url: input.cancelUrl,
      'metadata[paymentReference]': input.paymentReference,
    });

    if (input.email) {
      params.set('customer_email', input.email);
    }

    const res = await fetch(`${STRIPE_API}/checkout/sessions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.STRIPE_SECRET_KEY}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });

    const data = (await res.json()) as { url?: string; error?: { message?: string } };

    if (!res.ok || !data.url) {
      throw new AppError(
        data.error?.message ?? 'Stripe did not return a checkout URL',
        502,
        'PAYMENT_GATEWAY_ERROR',
      );
    }

    logger.info({ paymentReference: input.paymentReference }, 'Stripe checkout session created');
    return data.url;
  },

  /**
   * Verifies a Stripe webhook signature.
   * Stripe sends: Stripe-Signature: t=<ts>,v1=<hmac>
   * We compute: HMAC-SHA256(<ts>.<rawBody>, webhookSecret) and compare to v1.
   */
  verifySignature(rawBody: string, signatureHeader: string): { valid: boolean; event: StripeWebhookEvent | null } {
    if (!env.STRIPE_WEBHOOK_SECRET || !signatureHeader) return { valid: false, event: null };

    const parts = Object.fromEntries(
      signatureHeader.split(',').map((p) => {
        const idx = p.indexOf('=');
        return [p.slice(0, idx), p.slice(idx + 1)];
      }),
    );

    const timestamp = parts['t'];
    const v1 = parts['v1'];
    if (!timestamp || !v1) return { valid: false, event: null };

    // Reject events older than 5 minutes to prevent replay attacks
    const ageSeconds = (Date.now() / 1000) - Number(timestamp);
    if (ageSeconds > 300) {
      logger.warn({ ageSeconds }, 'Stripe webhook timestamp too old — possible replay');
      return { valid: false, event: null };
    }

    const expected = createHmac('sha256', env.STRIPE_WEBHOOK_SECRET)
      .update(`${timestamp}.${rawBody}`)
      .digest('hex');

    const expectedBuf = Buffer.from(expected, 'hex');
    const v1Buf = Buffer.from(v1, 'hex');

    if (expectedBuf.length !== v1Buf.length || !timingSafeEqual(expectedBuf, v1Buf)) {
      return { valid: false, event: null };
    }

    try {
      const event = JSON.parse(rawBody) as StripeWebhookEvent;
      return { valid: true, event };
    } catch {
      return { valid: false, event: null };
    }
  },
};
