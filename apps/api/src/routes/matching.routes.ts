import { Router, type Router as RouterType } from 'express';
import { matchingController } from '../controllers/matching.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

export const matchingRouter: RouterType = Router();

matchingRouter.use(authenticate);
matchingRouter.get('/', matchingController.listMatches);
matchingRouter.get('/:id', matchingController.getMatch);
matchingRouter.patch('/:id/respond', matchingController.respondToMatch);
matchingRouter.post('/priority', matchingController.requestPriorityMatch);
