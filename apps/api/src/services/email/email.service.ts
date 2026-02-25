import { Resend } from 'resend';
import { env } from '../../config/env.js';
import { logger } from '../../config/logger.js';
import { Notification } from '../../models/Notification.model.js';
import type {
  INotificationDocument,
  NotificationType,
} from '../../models/Notification.model.js';

const resend = new Resend(env.RESEND_API_KEY);

interface EmailNotificationContext {
  userId?: string;
  type: NotificationType;
  title: string;
  body: string;
  relatedMatchId?: string;
  relatedPaymentId?: string;
  data?: Record<string, unknown>;
}

interface SendEmailInput {
  to: string;
  subject: string;
  html: string;
  context?: EmailNotificationContext;
}

async function sendWithAudit(input: SendEmailInput): Promise<void> {
  let notification: INotificationDocument | null = null;

  if (input.context?.userId) {
    notification = await Notification.create({
      userId: input.context.userId,
      type: input.context.type,
      channel: 'email',
      status: 'pending',
      title: input.context.title,
      body: input.context.body,
      data: input.context.data,
      toEmail: input.to,
      relatedMatchId: input.context.relatedMatchId,
      relatedPaymentId: input.context.relatedPaymentId,
    });
  }

  try {
    const result = await resend.emails.send({
      from: env.EMAIL_FROM,
      to: input.to,
      subject: input.subject,
      html: input.html,
    });

    const resendMessageId = (result as { data?: { id?: string } }).data?.id;
    const resendError = (result as { error?: { message?: string } }).error;
    if (resendError) {
      throw new Error(resendError.message ?? 'Resend API error');
    }

    if (notification) {
      notification.status = 'sent';
      notification.sentAt = new Date();
      notification.resendMessageId = resendMessageId;
      await notification.save();
    }
  } catch (err) {
    if (notification) {
      notification.status = 'failed';
      notification.sentAt = new Date();
      await notification.save();
    }
    throw err;
  }
}

export const emailService = {
  async sendVerification(
    to: string,
    token: string,
    context?: { userId?: string },
  ): Promise<void> {
    const link = `${env.WEB_BASE_URL}/verify-email?token=${token}`;
    await sendWithAudit({
      to,
      subject: 'Verify your Kujuana email',
      html: `<p>Click <a href="${link}">here</a> to verify your email. Link expires in 15 minutes.</p>`,
      context: {
        userId: context?.userId,
        type: 'email_verified',
        title: 'Verify your email',
        body: 'Confirm your email address to activate your account.',
      },
    });
    logger.info({ to }, 'Verification email sent');
  },

  async sendPasswordReset(
    to: string,
    token: string,
    context?: {
      userId?: string;
      notificationType?: NotificationType;
      title?: string;
      body?: string;
    },
  ): Promise<void> {
    const link = `${env.WEB_BASE_URL}/reset-password?token=${token}`;
    await sendWithAudit({
      to,
      subject: 'Reset your Kujuana password',
      html: `<p>Click <a href="${link}">here</a> to reset your password. Link expires in 15 minutes.</p>`,
      context: context?.notificationType
        ? {
            userId: context.userId,
            type: context.notificationType,
            title: context.title ?? 'Password reset requested',
            body: context.body ?? 'Use the reset link to set a new password.',
          }
        : undefined,
    });
  },

  async sendMatchNotification(
    to: string,
    matchId: string,
    context?: { userId?: string },
  ): Promise<void> {
    const link = `${env.WEB_BASE_URL}/matches/${matchId}`;
    await sendWithAudit({
      to,
      subject: 'You have a new match on Kujuana',
      html: `<p>You have a new match! <a href="${link}">View your match</a>.</p>`,
      context: {
        userId: context?.userId,
        type: 'match_new',
        title: 'New match introduced',
        body: 'A new match is ready. Open Kujuana to view details.',
        relatedMatchId: matchId,
      },
    });
  },

  async sendPaymentReceipt(
    to: string,
    amount: number,
    currency: string,
    context?: { userId?: string; paymentId?: string },
  ): Promise<void> {
    await sendWithAudit({
      to,
      subject: 'Kujuana payment confirmation',
      html: `<p>Your payment of ${currency} ${amount} has been received. Thank you for subscribing to Kujuana.</p>`,
      context: {
        userId: context?.userId,
        type: 'payment_success',
        title: 'Payment successful',
        body: `Your payment of ${currency} ${amount} was received.`,
        relatedPaymentId: context?.paymentId,
      },
    });
  },
};
