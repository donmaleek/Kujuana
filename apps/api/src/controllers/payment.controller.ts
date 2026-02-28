import type { Request, Response, NextFunction } from 'express';
import { paymentsService } from '../services/payments/payments.service.js';
import { webhookService } from '../services/payments/webhook.service.js';
import { pesapalGateway } from '../services/payments/pesapal.gateway.js';
import { flutterwaveGateway } from '../services/payments/flutterwave.gateway.js';
import { AppError } from '../middleware/error.middleware.js';
import { logger } from '../config/logger.js';
import { Payment } from '../models/Payment.model.js';
import type { InitiatePaymentInput } from '@kujuana/shared';

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
      const purpose = typeof body['purpose'] === 'string' ? body['purpose'] : undefined;

      const fallbackTier =
        purpose === 'vip_monthly' || purpose === 'vip_addon'
          ? 'vip'
          : purpose?.startsWith('priority')
            ? 'priority'
            : 'standard';

      const payload: InitiatePaymentInput = {
        tier: (typeof body['tier'] === 'string' ? body['tier'] : fallbackTier) as InitiatePaymentInput['tier'],
        gateway: (
          typeof body['gateway'] === 'string'
            ? body['gateway']
            : method === 'flutterwave'
              ? 'flutterwave'
              : 'pesapal'
        ) as InitiatePaymentInput['gateway'],
        currency: (
          typeof body['currency'] === 'string'
            ? body['currency']
            : method === 'flutterwave'
              ? 'USD'
              : 'KES'
        ) as InitiatePaymentInput['currency'],
        returnUrl: typeof body['returnUrl'] === 'string' ? body['returnUrl'] : undefined,
      };

      const result = await paymentsService.initiatePayment(req.user!.userId, payload);
      if (method !== 'mpesa' && !result.checkoutUrl) {
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
        stk: method === 'mpesa',
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
};
