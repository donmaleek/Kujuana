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
  previewUrl?: string;
  context?: EmailNotificationContext;
}

export interface EmailDispatchResult {
  delivered: boolean;
  previewUrl?: string;
}

const isDev = env.NODE_ENV !== 'production';
const isPlaceholderResendKey = /^re_test$/i.test(env.RESEND_API_KEY.trim());

async function markNotificationFailed(
  notification: INotificationDocument | null,
  data?: Record<string, unknown>,
) {
  if (!notification) return;
  notification.status = 'failed';
  notification.sentAt = new Date();
  if (data) {
    notification.data = {
      ...(notification.data ?? {}),
      ...data,
    };
  }
  await notification.save();
}

async function markNotificationSent(
  notification: INotificationDocument | null,
  resendMessageId?: string,
) {
  if (!notification) return;
  notification.status = 'sent';
  notification.sentAt = new Date();
  if (resendMessageId) notification.resendMessageId = resendMessageId;
  await notification.save();
}

async function sendWithAudit(input: SendEmailInput): Promise<EmailDispatchResult> {
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

  if (isDev && isPlaceholderResendKey) {
    logger.warn(
      { to: input.to, subject: input.subject, previewUrl: input.previewUrl },
      'RESEND_API_KEY is placeholder; using development email preview fallback',
    );
    await markNotificationFailed(notification, {
      emailFallback: 'dev_preview',
      previewUrl: input.previewUrl,
      reason: 'RESEND_API_KEY placeholder',
    });
    return { delivered: false, previewUrl: input.previewUrl };
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

    await markNotificationSent(notification, resendMessageId);
    return { delivered: true };
  } catch (err) {
    if (isDev && input.previewUrl) {
      logger.warn(
        { err, to: input.to, subject: input.subject, previewUrl: input.previewUrl },
        'Email provider failed; using development email preview fallback',
      );
      await markNotificationFailed(notification, {
        emailFallback: 'dev_preview',
        previewUrl: input.previewUrl,
        reason: err instanceof Error ? err.message : 'unknown_error',
      });
      return { delivered: false, previewUrl: input.previewUrl };
    }

    await markNotificationFailed(notification);
    throw err;
  }
}

export const emailService = {
  async sendVerification(
    to: string,
    token: string,
    context?: { userId?: string },
  ): Promise<EmailDispatchResult> {
    const link = `${env.WEB_BASE_URL}/verify-email?token=${token}&email=${encodeURIComponent(to)}`;
    const result = await sendWithAudit({
      to,
      subject: 'Verify your Kujuana email',
      html: `<p>Click <a href="${link}">here</a> to verify your email. Link expires in 15 minutes.</p>`,
      previewUrl: link,
      context: {
        userId: context?.userId,
        type: 'email_verified',
        title: 'Verify your email',
        body: 'Confirm your email address to activate your account.',
      },
    });
    logger.info({ to, delivered: result.delivered, previewUrl: result.previewUrl }, 'Verification email dispatch result');
    return result;
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
  ): Promise<EmailDispatchResult> {
    const link = `${env.WEB_BASE_URL}/reset-password?token=${token}`;
    return sendWithAudit({
      to,
      subject: 'Reset your Kujuana password',
      html: `<p>Click <a href="${link}">here</a> to reset your password. Link expires in 15 minutes.</p>`,
      previewUrl: link,
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
  ): Promise<EmailDispatchResult> {
    const link = `${env.WEB_BASE_URL}/matches/${matchId}`;
    return sendWithAudit({
      to,
      subject: 'You have a new match on Kujuana',
      html: `<p>You have a new match! <a href="${link}">View your match</a>.</p>`,
      previewUrl: link,
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
  ): Promise<EmailDispatchResult> {
    return sendWithAudit({
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
