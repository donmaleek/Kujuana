import { Router, type Router as RouterType } from 'express';
import { authController } from '../controllers/auth.controller.js';
import { validate } from '../middleware/validate.middleware.js';
import { sessionRefresh } from '../middleware/session.middleware.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { authRateLimitMiddleware } from '../middleware/rateLimit.middleware.js';
import {
  registerSchema,
  loginSchema,
  verifyEmailSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from '@kujuana/shared';

export const authRouter: RouterType = Router();

authRouter.post('/register', authRateLimitMiddleware, validate(registerSchema), authController.register);
authRouter.post('/login', authRateLimitMiddleware, validate(loginSchema), authController.login);
authRouter.post('/refresh', authRateLimitMiddleware, sessionRefresh);
authRouter.post('/logout', authenticate, authController.logout);
authRouter.get('/me', authenticate, authController.me);
authRouter.post(
  '/verify-email',
  authRateLimitMiddleware,
  validate(verifyEmailSchema),
  authController.verifyEmail,
);
authRouter.post(
  '/resend-verification',
  authRateLimitMiddleware,
  validate(forgotPasswordSchema),
  authController.resendVerification,
);
authRouter.post(
  '/forgot-password',
  authRateLimitMiddleware,
  validate(forgotPasswordSchema),
  authController.forgotPassword,
);
authRouter.post(
  '/reset-password',
  authRateLimitMiddleware,
  validate(resetPasswordSchema),
  authController.resetPassword,
);
