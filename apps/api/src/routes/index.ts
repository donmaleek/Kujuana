import { Router } from 'express';
import { authRouter } from './auth.routes.js';
import { onboardingRouter } from './onboarding.routes.js';
import { profileRouter } from './profile.routes.js';
import { matchingRouter } from './matching.routes.js';
import { subscriptionRouter } from './subscription.routes.js';
import { paymentRouter } from './payment.routes.js';
import { uploadRouter } from './upload.routes.js';
import { adminRouter } from './admin.routes.js';

export const router = Router();

router.use('/auth', authRouter);
router.use('/onboarding', onboardingRouter);
router.use('/profile', profileRouter);
router.use('/matches', matchingRouter);
router.use('/subscriptions', subscriptionRouter);
router.use('/payments', paymentRouter);
router.use('/upload', uploadRouter);
router.use('/admin', adminRouter);
