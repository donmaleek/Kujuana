import { Router } from 'express';
import { matchingController } from '../controllers/matching.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

export const matchingRouter = Router();

matchingRouter.use(authenticate);
matchingRouter.get('/', matchingController.listMatches);
matchingRouter.get('/:id', matchingController.getMatch);
matchingRouter.post('/priority', matchingController.requestPriorityMatch);
