import { Router, type Router as RouterType } from 'express';
import { profileController } from '../controllers/profile.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { updateProfileSchema } from '@kujuana/shared';

export const profileRouter: RouterType = Router();

profileRouter.use(authenticate);
profileRouter.get('/me', profileController.getMe);
profileRouter.patch('/me', validate(updateProfileSchema), profileController.updateMe);
