import { Router, type Router as RouterType } from 'express';
import { subscriptionController } from '../controllers/subscription.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

export const subscriptionRouter: RouterType = Router();

subscriptionRouter.use(authenticate);
subscriptionRouter.get('/me', subscriptionController.getMySubscription);
subscriptionRouter.post('/cancel', subscriptionController.cancel);
