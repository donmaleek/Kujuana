import { Router, type Router as RouterType } from 'express';
import { profileController } from '../controllers/profile.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

export const profileRouter: RouterType = Router();

profileRouter.use(authenticate);
profileRouter.get('/me', profileController.getMe);
profileRouter.patch('/me', profileController.updateMe);
profileRouter.put('/me', profileController.updateMe);
