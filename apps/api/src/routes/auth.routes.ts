import { Router } from 'express';
import { authController } from '../controllers/auth.controller.js';
import { validate } from '../middleware/validate.middleware.js';
import { sessionRefresh } from '../middleware/session.middleware.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { registerSchema, loginSchema, verifyEmailSchema } from '@kujuana/shared';

export const authRouter = Router();

authRouter.post('/register', validate(registerSchema), authController.register);
authRouter.post('/login', validate(loginSchema), authController.login);
authRouter.post('/refresh', sessionRefresh);
authRouter.post('/logout', authenticate, authController.logout);
authRouter.post('/verify-email', validate(verifyEmailSchema), authController.verifyEmail);
