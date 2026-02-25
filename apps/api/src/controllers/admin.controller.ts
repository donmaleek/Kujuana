import type { Request, Response, NextFunction } from 'express';
import { User } from '../models/User.model.js';
import { Match } from '../models/Match.model.js';
import { AuditLog } from '../models/AuditLog.model.js';
import { matchmakerService } from '../services/admin/matchmaker.service.js';
import { moderationService } from '../services/admin/moderation.service.js';

export const adminController = {
  async getStats(_req: Request, res: Response, next: NextFunction) {
    try {
      const [totalUsers, totalMatches] = await Promise.all([
        User.countDocuments(),
        Match.countDocuments(),
      ]);
      res.json({ totalUsers, totalMatches });
    } catch (err) {
      next(err);
    }
  },

  async getVipQueue(_req: Request, res: Response, next: NextFunction) {
    try {
      const queue = await matchmakerService.getVipQueue();
      res.json(queue);
    } catch (err) {
      next(err);
    }
  },

  async introduceMatch(req: Request, res: Response, next: NextFunction) {
    try {
      await matchmakerService.introduceMatch(
        req.params['matchId']!,
        req.body.note,
        req.user!.userId,
      );
      res.json({ message: 'Match introduced' });
    } catch (err) {
      next(err);
    }
  },

  async getAuditLog(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt((req.query['page'] as string) ?? '1', 10);
      const limit = 50;
      const logs = await AuditLog.find()
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit);
      res.json(logs);
    } catch (err) {
      next(err);
    }
  },

  async suspendUser(req: Request, res: Response, next: NextFunction) {
    try {
      await moderationService.suspendUser(
        req.params['userId']!,
        req.body.reason,
        req.user!.userId,
      );
      res.json({ message: 'User suspended' });
    } catch (err) {
      next(err);
    }
  },
};
