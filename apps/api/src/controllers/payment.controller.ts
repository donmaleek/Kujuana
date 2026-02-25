import type { Request, Response, NextFunction } from 'express';
import { paymentsService } from '../services/payments/payments.service.js';
import { webhookService } from '../services/payments/webhook.service.js';
import { pesapalGateway } from '../services/payments/pesapal.gateway.js';
import { flutterwaveGateway } from '../services/payments/flutterwave.gateway.js';
import { AppError } from '../middleware/error.middleware.js';
import { logger } from '../config/logger.js';

function getRawPayload(req: Request): string {
  if (typeof req.rawBody === 'string') return req.rawBody;
  if (typeof req.body === 'string') return req.body;
  if (Buffer.isBuffer(req.body)) return req.body.toString('utf8');
  return JSON.stringify(req.body ?? {});
}

export const paymentController = {
  async initiate(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await paymentsService.initiatePayment(req.user!.userId, req.body);
      res.json(result);
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
