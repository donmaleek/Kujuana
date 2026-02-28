import { Router, type Router as RouterType } from 'express';
import { onboardingController } from '../controllers/onboarding.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

export const onboardingRouter: RouterType = Router();

onboardingRouter.use(authenticate);
onboardingRouter.get('/progress', onboardingController.getProgress);
onboardingRouter.put('/step/:step', onboardingController.saveStep);
onboardingRouter.post('/step/:step', onboardingController.saveStep);
onboardingRouter.post('/submit', onboardingController.submit);
