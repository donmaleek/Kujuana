import type { Request, Response, NextFunction } from 'express';
import { paymentsService } from '../services/payments/payments.service.js';
import { webhookService } from '../services/payments/webhook.service.js';
import { pesapalGateway } from '../services/payments/pesapal.gateway.js';
import { flutterwaveGateway } from '../services/payments/flutterwave.gateway.js';
import { AppError } from '../middleware/error.middleware.js';

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
      const payload = JSON.stringify(req.body);
      if (!pesapalGateway.verifySignature(payload, signature)) {
        return next(new AppError('Invalid webhook signature', 400));
      }
      await webhookService.handlePaymentSuccess(req.body.order_tracking_id, 'pesapal');
      res.json({ status: 'OK' });
    } catch (err) {
      next(err);
    }
  },

  async flutterwaveWebhook(req: Request, res: Response, next: NextFunction) {
    try {
      const signature = req.headers['verif-hash'] as string;
      const payload = JSON.stringify(req.body);
      if (!flutterwaveGateway.verifySignature(payload, signature)) {
        return next(new AppError('Invalid webhook signature', 400));
      }
      await webhookService.handlePaymentSuccess(req.body.data.tx_ref, 'flutterwave');
      res.json({ status: 'OK' });
    } catch (err) {
      next(err);
    }
  },
};
