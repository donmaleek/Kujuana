import { Router, type Router as RouterType } from 'express';
import { paymentController } from '../controllers/payment.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

export const paymentRouter: RouterType = Router();

paymentRouter.post(
  '/initiate',
  authenticate,
  paymentController.initiate,
);
paymentRouter.get('/:reference/status', authenticate, paymentController.status);

// Webhooks – no auth (gateway-signed)
paymentRouter.post('/webhook/pesapal', paymentController.pesapalWebhook);
paymentRouter.post('/webhook/flutterwave', paymentController.flutterwaveWebhook);
paymentRouter.post('/webhook/paystack', paymentController.paystackWebhook);
paymentRouter.post('/webhook/mpesa', paymentController.mpesaWebhook);
// Backward-compatible aliases used by docs/older clients.
paymentRouter.post('/pesapal/webhook', paymentController.pesapalWebhook);
paymentRouter.post('/flutterwave/webhook', paymentController.flutterwaveWebhook);
paymentRouter.post('/paystack/webhook', paymentController.paystackWebhook);
paymentRouter.post('/mpesa/webhook', paymentController.mpesaWebhook);
paymentRouter.post('/webhook/stripe', paymentController.stripeWebhook);
paymentRouter.post('/stripe/webhook', paymentController.stripeWebhook);
