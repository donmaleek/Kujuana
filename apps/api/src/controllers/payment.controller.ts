import type { Request, Response, NextFunction } from 'express';
import { paymentsService } from '../services/payments/payments.service.js';
import { webhookService } from '../services/payments/webhook.service.js';
import { pesapalGateway } from '../services/payments/pesapal.gateway.js';
import { flutterwaveGateway } from '../services/payments/flutterwave.gateway.js';
import { paystackGateway } from '../services/payments/paystack.gateway.js';
import { stripeGateway } from '../services/payments/stripe.gateway.js';
import { AppError } from '../middleware/error.middleware.js';
import { logger } from '../config/logger.js';
import { Payment } from '../models/Payment.model.js';
import type { InitiatePaymentInput, PaymentPurpose } from '@kujuana/shared';

function getRawPayload(req: Request): string {
  if (typeof req.rawBody === 'string') return req.rawBody;
  if (typeof req.body === 'string') return req.body;
  if (Buffer.isBuffer(req.body)) return req.body.toString('utf8');
  return JSON.stringify(req.body ?? {});
}

export const paymentController = {
  async initiate(req: Request, res: Response, next: NextFunction) {
    try {
      const body = req.body as Record<string, unknown>;

      const method = typeof body['method'] === 'string' ? body['method'] : undefined;
      const purposeInput = typeof body['purpose'] === 'string' ? body['purpose'] : undefined;
      const purpose = (() => {
        const normalized = String(purposeInput ?? '').trim().toLowerCase();
        if (!normalized) return undefined;
        if (normalized === 'priority_5pack') return 'priority_bundle_5';
        if (normalized === 'priority_10pack') return 'priority_bundle_10';
        if (normalized === 'vip_addon') return 'vip_monthly';
        return normalized;
      })() as PaymentPurpose | undefined;

      const fallbackTier =
        purpose === 'vip_monthly'
          ? 'vip'
          : purpose?.startsWith('priority')
            ? 'priority'
            : 'standard';

      const inferredGateway =
        typeof body['gateway'] === 'string'
          ? body['gateway'] === 'mpesa'
            ? 'mpesa'
            : body['gateway']
          : method === 'stripe'
            ? 'stripe'
            : method === 'flutterwave'
              ? 'flutterwave'
              : method === 'mpesa'
                ? 'mpesa'
                : method === 'paystack'
                  ? 'paystack'
                  : 'pesapal';

      const inferredCurrency =
        typeof body['currency'] === 'string'
          ? body['currency']
          : inferredGateway === 'flutterwave'
            ? 'USD'
            : 'KES';

      const payload: InitiatePaymentInput = {
        tier: (typeof body['tier'] === 'string' ? body['tier'] : fallbackTier) as InitiatePaymentInput['tier'],
        gateway: inferredGateway as InitiatePaymentInput['gateway'],
        currency: inferredCurrency as InitiatePaymentInput['currency'],
        purpose,
        phone: typeof body['phone'] === 'string' ? body['phone'] : undefined,
        returnUrl: typeof body['returnUrl'] === 'string' ? body['returnUrl'] : undefined,
      } as InitiatePaymentInput & { purpose?: PaymentPurpose; phone?: string };

      const result = await paymentsService.initiatePayment(req.user!.userId, payload);
      if (payload.gateway !== 'mpesa' && !result.checkoutUrl) {
        return next(
          new AppError(
            'Payment gateway did not return a checkout URL. Please retry with a different method.',
            502,
            'PAYMENT_GATEWAY_ERROR',
          ),
        );
      }
      res.json({
        ...result,
        reference: result.paymentReference,
        redirectUrl: result.checkoutUrl ?? null,
        stk: false,
        message: typeof (result as { message?: unknown }).message === 'string' ? (result as { message?: string }).message : undefined,
        simulated: Boolean((result as { simulated?: boolean }).simulated),
      });
    } catch (err) {
      next(err);
    }
  },

  async status(req: Request, res: Response, next: NextFunction) {
    try {
      const reference = String(req.params['reference'] ?? '').trim();
      if (!reference) return next(new AppError('Payment reference is required', 400));

      const searchConditions: Array<Record<string, unknown>> = [
        { internalRef: reference },
        { reference },
      ];
      if (/^[0-9a-fA-F]{24}$/.test(reference)) {
        searchConditions.push({ _id: reference });
      }

      const payment = await Payment.findOne({ $or: searchConditions });

      if (!payment) return next(new AppError('Payment not found', 404));
      if (payment.userId.toString() !== req.user!.userId) {
        return next(new AppError('Payment not found', 404));
      }

      const status =
        payment.status === 'completed'
          ? 'completed'
          : payment.status === 'refunded'
            ? 'cancelled'
            : payment.status === 'failed'
              ? 'failed'
              : 'pending';

      res.json({
        reference: payment.internalRef,
        status,
        payment: {
          id: payment._id.toString(),
          gateway: payment.gateway,
          amount: payment.amount,
          currency: payment.currency,
          createdAt: (payment as any).createdAt,
          updatedAt: (payment as any).updatedAt,
        },
      });
    } catch (err) {
      next(err);
    }
  },

  async pesapalWebhook(req: Request, res: Response, next: NextFunction) {
    try {
      const signature = req.headers['pesapal-signature'] as string;
      if (!signature) return next(new AppError('Missing webhook signature', 400));
      const payload = getRawPayload(req);
      if (!pesapalGateway.verifySignature(payload, signature)) {
        return next(new AppError('Invalid webhook signature', 400));
      }

      const payloadBody = req.body as Record<string, unknown>;
      const paymentReference =
        String(
          payloadBody['merchant_reference'] ??
            payloadBody['merchantReference'] ??
            payloadBody['id'] ??
            '',
        ) || String(payloadBody['order_tracking_id'] ?? '');
      if (!paymentReference) {
        return next(new AppError('Missing payment reference in webhook payload', 400));
      }

      const gatewayTransactionRef = String(
        payloadBody['order_tracking_id'] ?? payloadBody['orderTrackingId'] ?? paymentReference,
      );
      await webhookService.handlePaymentSuccess({
        paymentReference,
        gateway: 'pesapal',
        gatewayTransactionRef,
        webhookPayload: payloadBody,
      });
      res.json({ status: 'OK' });
    } catch (err) {
      next(err);
    }
  },

  async flutterwaveWebhook(req: Request, res: Response, next: NextFunction) {
    try {
      const signature = req.headers['verif-hash'] as string;
      if (!signature) return next(new AppError('Missing webhook signature', 400));
      const payload = getRawPayload(req);
      if (!flutterwaveGateway.verifySignature(payload, signature)) {
        return next(new AppError('Invalid webhook signature', 400));
      }

      const payloadBody = req.body as {
        data?: { tx_ref?: string; id?: string | number; flw_ref?: string; status?: string };
      };
      const status = payloadBody.data?.status?.toLowerCase();
      if (status && !['successful', 'completed'].includes(status)) {
        logger.info({ status }, 'Ignoring non-successful Flutterwave webhook');
        return res.json({ status: 'IGNORED' });
      }

      const paymentReference = payloadBody.data?.tx_ref?.trim();
      if (!paymentReference) {
        return next(new AppError('Missing payment reference in webhook payload', 400));
      }
      const gatewayTransactionRef = String(
        payloadBody.data?.id ?? payloadBody.data?.flw_ref ?? paymentReference,
      );

      await webhookService.handlePaymentSuccess({
        paymentReference,
        gateway: 'flutterwave',
        gatewayTransactionRef,
        webhookPayload: req.body as Record<string, unknown>,
      });
      res.json({ status: 'OK' });
    } catch (err) {
      next(err);
    }
  },

  async paystackWebhook(req: Request, res: Response, next: NextFunction) {
    try {
      const signature = String(req.headers['x-paystack-signature'] ?? '').trim();
      if (!signature) return next(new AppError('Missing webhook signature', 400));
      const payload = getRawPayload(req);
      if (!paystackGateway.verifySignature(payload, signature)) {
        return next(new AppError('Invalid webhook signature', 400));
      }

      const payloadBody = req.body as {
        event?: string;
        data?: {
          reference?: string;
          id?: string | number;
          status?: string;
          gateway_response?: string;
          message?: string;
        };
      };

      const paymentReference = String(payloadBody.data?.reference ?? '').trim();
      if (!paymentReference) {
        logger.info({ event: payloadBody.event }, 'Ignoring Paystack webhook without payment reference');
        return res.json({ status: 'IGNORED' });
      }

      const event = String(payloadBody.event ?? '').toLowerCase();
      const status = String(payloadBody.data?.status ?? '').toLowerCase();
      const gatewayTransactionRef = String(
        payloadBody.data?.id ?? paymentReference,
      ).trim();

      if (event === 'charge.success' || status === 'success') {
        await webhookService.handlePaymentSuccess({
          paymentReference,
          gateway: 'paystack',
          gatewayTransactionRef,
          webhookPayload: req.body as Record<string, unknown>,
        });
        return res.json({ status: 'OK' });
      }

      const isFailure = event === 'charge.failed' || status === 'failed' || status === 'abandoned';
      if (!isFailure) {
        logger.info({ event, status }, 'Ignoring non-terminal Paystack webhook event');
        return res.json({ status: 'IGNORED' });
      }

      await webhookService.handlePaymentFailure({
        paymentReference,
        gateway: 'paystack',
        gatewayTransactionRef,
        failureReason:
          String(payloadBody.data?.gateway_response ?? payloadBody.data?.message ?? 'Paystack charge failed') ||
          'Paystack charge failed',
        webhookPayload: req.body as Record<string, unknown>,
      });
      return res.json({ status: 'OK' });
    } catch (err) {
      next(err);
    }
  },

  async mpesaWebhook(req: Request, res: Response, next: NextFunction) {
    try {
      const payload = req.body as Record<string, unknown>;
      const body = payload['Body'] as Record<string, unknown> | undefined;
      const callback = body?.['stkCallback'] as Record<string, unknown> | undefined;

      if (!callback) {
        logger.warn({ payload }, 'M-Pesa webhook missing stkCallback payload');
        return res.status(200).json({ ResultCode: 0, ResultDesc: 'Accepted' });
      }

      const checkoutRequestId = String(
        callback['CheckoutRequestID'] ?? callback['checkoutRequestId'] ?? '',
      ).trim();
      const merchantRequestId = String(
        callback['MerchantRequestID'] ?? callback['merchantRequestId'] ?? '',
      ).trim();
      const resultCodeRaw = callback['ResultCode'] ?? callback['resultCode'];
      const resultCode = Number(resultCodeRaw);
      const resultDesc = String(callback['ResultDesc'] ?? callback['resultDesc'] ?? '').trim();

      if (!checkoutRequestId && !merchantRequestId) {
        logger.warn({ callback }, 'M-Pesa webhook missing request identifiers');
        return res.status(200).json({ ResultCode: 0, ResultDesc: 'Accepted' });
      }

      const callbackMetadata = callback['CallbackMetadata'] as Record<string, unknown> | undefined;
      const callbackItems = Array.isArray(callbackMetadata?.['Item'])
        ? (callbackMetadata?.['Item'] as Array<Record<string, unknown>>)
        : [];
      const receiptItem = callbackItems.find(
        (item) => String(item['Name'] ?? '').toLowerCase() === 'mpesareceiptnumber',
      );
      const gatewayTransactionRef = String(
        receiptItem?.['Value'] ?? checkoutRequestId ?? merchantRequestId,
      ).trim();

      const paymentReference = checkoutRequestId || merchantRequestId;
      if (Number.isFinite(resultCode) && resultCode === 0) {
        await webhookService.handlePaymentSuccess({
          paymentReference,
          gateway: 'mpesa',
          gatewayTransactionRef,
          webhookPayload: payload,
        });
      } else {
        await webhookService.handlePaymentFailure({
          paymentReference,
          gateway: 'mpesa',
          gatewayTransactionRef,
          failureReason: `${resultDesc || 'M-Pesa payment failed'} (code ${
            Number.isFinite(resultCode) ? String(resultCode) : 'unknown'
          })`,
          webhookPayload: payload,
        });
      }

      return res.status(200).json({ ResultCode: 0, ResultDesc: 'Accepted' });
    } catch (err) {
      next(err);
    }
  },

  async stripeWebhook(req: Request, res: Response, next: NextFunction) {
    try {
      const signatureHeader = String(req.headers['stripe-signature'] ?? '').trim();
      if (!signatureHeader) return next(new AppError('Missing Stripe-Signature header', 400));

      const rawBody = getRawPayload(req);
      const { valid, event } = stripeGateway.verifySignature(rawBody, signatureHeader);

      if (!valid || !event) {
        return next(new AppError('Invalid Stripe webhook signature', 400));
      }

      // Only process completed checkout sessions
      if (event.type !== 'checkout.session.completed') {
        logger.info({ type: event.type }, 'Ignoring non-checkout Stripe webhook event');
        return res.json({ status: 'IGNORED' });
      }

      const session = event.data.object;
      if (session.payment_status !== 'paid') {
        logger.info({ payment_status: session.payment_status }, 'Stripe session not paid — ignoring');
        return res.json({ status: 'IGNORED' });
      }

      const paymentReference = session.metadata?.['paymentReference'];
      if (!paymentReference) {
        return next(new AppError('Missing paymentReference in Stripe session metadata', 400));
      }

      const gatewayTransactionRef = session.payment_intent ?? session.id;

      await webhookService.handlePaymentSuccess({
        paymentReference,
        gateway: 'stripe',
        gatewayTransactionRef,
        webhookPayload: event as unknown as Record<string, unknown>,
      });

      res.json({ status: 'OK' });
    } catch (err) {
      next(err);
    }
  },
};
