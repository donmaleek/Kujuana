import { Match } from '../../models/Match.model.js';
import { AuditLog } from '../../models/AuditLog.model.js';
import { AppError } from '../../middleware/error.middleware.js';
import { emailService } from '../email/email.service.js';
import { User } from '../../models/User.model.js';

export const matchmakerService = {
  async getVipQueue() {
    return Match.find({ tier: 'vip', status: 'pending' })
      .sort({ createdAt: 1 })
      .populate('userId', 'fullName email')
      .populate('matchedUserId', 'fullName email');
  },

  async introduceMatch(
    matchId: string,
    note: string,
    matchmakerId: string,
  ): Promise<void> {
    const match = await Match.findById(matchId);
    if (!match) throw new AppError('Match not found', 404);
    if (match.tier !== 'vip') throw new AppError('Only VIP matches can be introduced', 400);

    match.introductionNote = note;
    match.status = 'active';
    await match.save();

    await AuditLog.create({
      actorId: matchmakerId,
      actorRole: 'matchmaker',
      targetUserId: match.userId,
      action: 'matchmaker_action',
      resourceType: 'Match',
      resourceId: matchId,
      metadata: { action: 'introduce', note: note.substring(0, 100) },
    });

    // Notify both parties
    const [user, matchedUser] = await Promise.all([
      User.findById(match.userId),
      User.findById(match.matchedUserId),
    ]);
    if (user) await emailService.sendMatchNotification(user.email, matchId);
    if (matchedUser) await emailService.sendMatchNotification(matchedUser.email, matchId);
  },
};
