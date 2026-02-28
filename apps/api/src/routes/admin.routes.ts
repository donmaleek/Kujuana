import { Router, type Router as RouterType } from 'express';
import { adminController } from '../controllers/admin.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/role.middleware.js';

export const adminRouter: RouterType = Router();

// Initial admin bootstrap (one-time). Requires shared secret, no auth.
adminRouter.post('/bootstrap', adminController.bootstrapAdmin);

adminRouter.use(authenticate, requireRole('admin', 'manager', 'matchmaker'));

adminRouter.get('/stats', requireRole('admin', 'manager'), adminController.getStats);
adminRouter.get('/queue', adminController.getVipQueue);
adminRouter.post('/queue/:requestId/review', adminController.markQueueInReview);
adminRouter.get('/members', adminController.listMembers);
adminRouter.get('/members/:userId', adminController.getMember);
adminRouter.get('/matches/:matchId', adminController.getMatchDetail);
adminRouter.post('/matches/:matchId/note', adminController.saveMatchNote);
adminRouter.post('/matches/:matchId/introduce', adminController.introduceMatch);
adminRouter.get('/audit', requireRole('admin', 'manager'), adminController.getAuditLog);
adminRouter.post('/members/:userId/suspend', requireRole('admin', 'manager'), adminController.suspendUser);
