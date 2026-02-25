import { User } from '../models/User.model.js';
import { Profile } from '../models/Profile.model.js';
import { Match } from '../models/Match.model.js';
import { Subscription } from '../models/Subscription.model.js';
import { Payment } from '../models/Payment.model.js';
import { DeviceSession } from '../models/DeviceSession.model.js';
import { AuditLog } from '../models/AuditLog.model.js';
import { logger } from '../config/logger.js';

export async function ensureIndexes(): Promise<void> {
  await Promise.all([
    User.ensureIndexes(),
    Profile.ensureIndexes(),
    Match.ensureIndexes(),
    Subscription.ensureIndexes(),
    Payment.ensureIndexes(),
    DeviceSession.ensureIndexes(),
    AuditLog.ensureIndexes(),
  ]);
  logger.info('Database indexes ensured');
}
