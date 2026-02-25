import { Subscription } from '../models/Subscription.model.js';
import { emailService } from '../services/email/email.service.js';
import { User } from '../models/User.model.js';
import { logger } from '../config/logger.js';

/**
 * Run daily to expire subscriptions and send renewal reminders.
 */
export async function processSubscriptionExpiries() {
  const now = new Date();

  // Expire past-due active subscriptions
  const expired = await Subscription.updateMany(
    { status: 'active', currentPeriodEnd: { $lte: now } },
    { status: 'expired' },
  );
  logger.info({ count: expired.modifiedCount }, 'Subscriptions expired');

  // Reminders: 3 days before expiry
  const reminderDate = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
  const expiringSoon = await Subscription.find({
    status: 'active',
    currentPeriodEnd: { $lte: reminderDate, $gte: now },
    cancelAtPeriodEnd: false,
  });

  for (const sub of expiringSoon) {
    const user = await User.findById(sub.userId);
    if (user) {
      // TODO: await emailService.sendRenewalReminder(user.email, sub.currentPeriodEnd);
      logger.info({ userId: user._id.toString() }, 'Renewal reminder queued');
    }
  }
}
