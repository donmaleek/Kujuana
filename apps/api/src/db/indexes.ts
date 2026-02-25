import { User } from '../models/User.model.js';
import { Profile } from '../models/Profile.model.js';
import { Match } from '../models/Match.model.js';
import { Subscription } from '../models/Subscription.model.js';
import { Payment } from '../models/Payment.model.js';
import { DeviceSession } from '../models/DeviceSession.model.js';
import { AuditLog } from '../models/AuditLog.model.js';
import { Notification } from '../models/Notification.model.js';
import { logger } from '../config/logger.js';

export async function ensureIndexes(): Promise<void> {
  const tasks = [
    { name: 'User', run: () => User.ensureIndexes() },
    { name: 'Profile', run: () => Profile.ensureIndexes() },
    { name: 'Match', run: () => Match.ensureIndexes() },
    { name: 'Subscription', run: () => Subscription.ensureIndexes() },
    { name: 'Payment', run: () => Payment.ensureIndexes() },
    { name: 'DeviceSession', run: () => DeviceSession.ensureIndexes() },
    { name: 'AuditLog', run: () => AuditLog.ensureIndexes() },
    { name: 'Notification', run: () => Notification.ensureIndexes() },
  ];

  const results = await Promise.allSettled(tasks.map((task) => task.run()));
  const failures = results.flatMap((result, index) => {
    if (result.status !== 'rejected') return [];
    return [{ err: result.reason as any, model: tasks[index]!.name }];
  });

  const fatal = failures.filter(({ err }) => err?.code !== 86);
  const conflicts = failures.filter(({ err }) => err?.code === 86);
  for (const conflict of conflicts) {
    logger.warn({ model: conflict.model, err: conflict.err }, 'Index conflict ignored');
  }
  if (fatal.length > 0) {
    throw fatal[0]!.err;
  }

  logger.info('Database indexes ensured');
}
