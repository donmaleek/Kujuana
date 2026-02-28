import { Buffer } from 'buffer';
import { AppError } from '../../middleware/error.middleware.js';
import { env } from '../../config/env.js';
import { logger } from '../../config/logger.js';
import { assertGatewayConfigured } from './gateway-config.js';

interface MpesaInitiateInput {
  paymentReference: string;
  amount: number;
  currency: string;
  phone: string;
}

interface MpesaTokenResponse {
  access_token?: string;
  expires_in?: string;
  errorMessage?: string;
  errorCode?: string;
  error_description?: string;
}

interface MpesaStkResponse {
  MerchantRequestID?: string;
  CheckoutRequestID?: string;
  ResponseCode?: string;
  ResponseDescription?: string;
  CustomerMessage?: string;
  errorCode?: string;
  errorMessage?: string;
  requestId?: string;
}

export interface MpesaInitiateResult {
  merchantRequestId: string;
  checkoutRequestId: string;
  responseDescription?: string;
  customerMessage?: string;
  phoneE164: string;
  phoneDaraja: string;
}

const BASE_URL =
  env.MPESA_ENV === 'live' ? 'https://api.safaricom.co.ke' : 'https://sandbox.safaricom.co.ke';

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

function assertConfigured() {
  assertGatewayConfigured('M-Pesa', {
    MPESA_CONSUMER_KEY: env.MPESA_CONSUMER_KEY,
    MPESA_CONSUMER_SECRET: env.MPESA_CONSUMER_SECRET,
    MPESA_SHORTCODE: env.MPESA_SHORTCODE,
    MPESA_PASSKEY: env.MPESA_PASSKEY,
    MPESA_CALLBACK_URL: env.MPESA_CALLBACK_URL,
  });
}

function buildTimestamp(date = new Date()): string {
  const yyyy = String(date.getFullYear());
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  const hh = String(date.getHours()).padStart(2, '0');
  const min = String(date.getMinutes()).padStart(2, '0');
  const ss = String(date.getSeconds()).padStart(2, '0');
  return `${yyyy}${mm}${dd}${hh}${min}${ss}`;
}

function normalizePhone(raw: string): { e164: string; daraja: string } {
  const compact = raw.replace(/[\s()-]/g, '');
  const digitsOnly = compact.replace(/\D/g, '');

  if (compact.startsWith('+254') && digitsOnly.length === 12) {
    return { e164: `+${digitsOnly}`, daraja: digitsOnly };
  }
  if (digitsOnly.startsWith('254') && digitsOnly.length === 12) {
    return { e164: `+${digitsOnly}`, daraja: digitsOnly };
  }
  if (digitsOnly.startsWith('0') && digitsOnly.length === 10) {
    const daraja = `254${digitsOnly.slice(1)}`;
    return { e164: `+${daraja}`, daraja };
  }
  if ((digitsOnly.startsWith('7') || digitsOnly.startsWith('1')) && digitsOnly.length === 9) {
    const daraja = `254${digitsOnly}`;
    return { e164: `+${daraja}`, daraja };
  }

  throw new AppError(
    'Phone number must be a valid Kenyan mobile in E.164 format (e.g. +2547XXXXXXXX)',
    400,
    'INVALID_PHONE_NUMBER',
  );
}

function toAccountReference(input: string): string {
  const cleaned = input.replace(/[^A-Za-z0-9]/g, '').slice(0, 12);
  return cleaned || 'KUJUANA';
}

export const mpesaGateway = {
  normalizePhone,

  async getToken(): Promise<string> {
    assertConfigured();

    const auth = Buffer.from(`${env.MPESA_CONSUMER_KEY}:${env.MPESA_CONSUMER_SECRET}`).toString(
      'base64',
    );
    const res = await fetch(`${BASE_URL}/oauth/v1/generate?grant_type=client_credentials`, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        Authorization: `Basic ${auth}`,
      },
    });

    const data = (await res.json().catch(() => ({}))) as MpesaTokenResponse;
    const token = data.access_token?.trim();
    if (!res.ok || !token) {
      throw new AppError(
        gatewayMessage(
          data.errorMessage ?? data.error_description,
          'M-Pesa token request failed. Check Daraja credentials and environment.',
        ),
        502,
        'PAYMENT_GATEWAY_ERROR',
      );
    }

    return token;
  },

  async initiate(input: MpesaInitiateInput): Promise<MpesaInitiateResult> {
    assertConfigured();

    if (input.currency !== 'KES') {
      throw new AppError('M-Pesa only supports KES payments.', 400, 'INVALID_PAYMENT_CURRENCY');
    }

    const { e164, daraja } = normalizePhone(input.phone);
    const amount = Math.max(1, Math.round(input.amount));
    const timestamp = buildTimestamp();
    const password = Buffer.from(`${env.MPESA_SHORTCODE}${env.MPESA_PASSKEY}${timestamp}`).toString(
      'base64',
    );

    const res = await fetch(`${BASE_URL}/mpesa/stkpush/v1/processrequest`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${await this.getToken()}`,
      },
      body: JSON.stringify({
        BusinessShortCode: env.MPESA_SHORTCODE,
        Password: password,
        Timestamp: timestamp,
        TransactionType: env.MPESA_TRANSACTION_TYPE,
        Amount: amount,
        PartyA: daraja,
        PartyB: env.MPESA_SHORTCODE,
        PhoneNumber: daraja,
        CallBackURL: env.MPESA_CALLBACK_URL,
        AccountReference: toAccountReference(input.paymentReference),
        TransactionDesc: 'Kujuana',
      }),
    });

    const data = (await res.json().catch(() => ({}))) as MpesaStkResponse;
    const responseCode = String(data.ResponseCode ?? '').trim();
    const merchantRequestId = String(data.MerchantRequestID ?? '').trim();
    const checkoutRequestId = String(data.CheckoutRequestID ?? '').trim();

    if (!res.ok || responseCode !== '0' || !checkoutRequestId || !merchantRequestId) {
      throw new AppError(
        gatewayMessage(
          data.errorMessage ?? data.ResponseDescription,
          'M-Pesa STK push failed. Confirm shortcode/passkey/callback URL and try again.',
        ),
        502,
        'PAYMENT_GATEWAY_ERROR',
      );
    }

    logger.info(
      {
        paymentReference: input.paymentReference,
        checkoutRequestId,
        merchantRequestId,
      },
      'M-Pesa STK push initiated',
    );

    return {
      merchantRequestId,
      checkoutRequestId,
      responseDescription: data.ResponseDescription,
      customerMessage: data.CustomerMessage,
      phoneE164: e164,
      phoneDaraja: daraja,
    };
  },
};
