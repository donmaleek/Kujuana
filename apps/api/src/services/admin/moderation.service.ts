import { User } from '../../models/User.model.js';
import { AuditLog } from '../../models/AuditLog.model.js';
import { AppError } from '../../middleware/error.middleware.js';

export const moderationService = {
  async suspendUser(userId: string, reason: string, adminId: string): Promise<void> {
    const user = await User.findByIdAndUpdate(
      userId,
      { isSuspended: true, suspendedReason: reason },
      { new: true },
    );
    if (!user) throw new AppError('User not found', 404);

    await AuditLog.create({
      actorId: adminId,
      actorRole: 'admin',
      targetUserId: userId,
      action: 'suspension',
      resourceType: 'User',
      resourceId: userId,
      metadata: { reason },
    });
  },

  async unsuspendUser(userId: string, adminId: string): Promise<void> {
    const user = await User.findByIdAndUpdate(
      userId,
      { isSuspended: false, suspendedReason: undefined },
      { new: true },
    );
    if (!user) throw new AppError('User not found', 404);

    await AuditLog.create({
      actorId: adminId,
      actorRole: 'admin',
      targetUserId: userId,
      action: 'unsuspension',
      resourceType: 'User',
      resourceId: userId,
      metadata: {},
    });
  },
};
