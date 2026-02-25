import { Router, type Router as RouterType } from 'express';
import { notificationController } from '../controllers/notification.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

export const notificationRouter: RouterType = Router();

notificationRouter.use(authenticate);
notificationRouter.get('/', notificationController.list);
notificationRouter.patch('/:id/read', notificationController.markAsRead);
notificationRouter.post('/read-all', notificationController.markAllAsRead);
