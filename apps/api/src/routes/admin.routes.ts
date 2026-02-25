import { Router, type Router as RouterType } from 'express';
import { adminController } from '../controllers/admin.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/role.middleware.js';

export const adminRouter: RouterType = Router();

adminRouter.use(authenticate, requireRole('admin', 'matchmaker'));

adminRouter.get('/stats', requireRole('admin'), adminController.getStats);
adminRouter.get('/queue', adminController.getVipQueue);
adminRouter.post('/matches/:matchId/introduce', adminController.introduceMatch);
adminRouter.get('/audit', requireRole('admin'), adminController.getAuditLog);
adminRouter.post('/members/:userId/suspend', requireRole('admin'), adminController.suspendUser);
