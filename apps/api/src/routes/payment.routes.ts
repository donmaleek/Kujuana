import { Router, type Router as RouterType } from 'express';
import { paymentController } from '../controllers/payment.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { initiatePaymentSchema } from '@kujuana/shared';

export const paymentRouter: RouterType = Router();

paymentRouter.post(
  '/initiate',
  authenticate,
  validate(initiatePaymentSchema),
  paymentController.initiate,
);

// Webhooks – no auth (gateway-signed)
paymentRouter.post('/webhook/pesapal', paymentController.pesapalWebhook);
paymentRouter.post('/webhook/flutterwave', paymentController.flutterwaveWebhook);
