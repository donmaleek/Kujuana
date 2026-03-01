import nodemailer from 'nodemailer';
import { Resend } from 'resend';
import { env } from '../../config/env.js';
import { logger } from '../../config/logger.js';
import { Notification } from '../../models/Notification.model.js';
import type {
  INotificationDocument,
  NotificationType,
} from '../../models/Notification.model.js';

// ── Transport selection ────────────────────────────────────────────────────
// Use nodemailer (SMTP) when SMTP_HOST is configured, otherwise fall back to Resend.
const smtpTransport = env.SMTP_HOST
  ? nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_SECURE,
      // Disable TLS when no credentials — plain SMTP relay (e.g. local Postfix)
      ignoreTLS: !env.SMTP_USER,
      auth:
        env.SMTP_USER && env.SMTP_PASS
          ? { user: env.SMTP_USER, pass: env.SMTP_PASS }
          : undefined,
    })
  : null;

const resendClient = env.SMTP_HOST ? null : new Resend(env.RESEND_API_KEY);
const isPlaceholderResendKey = /^(placeholder|re_test)$/i.test(env.RESEND_API_KEY.trim());

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

async function markNotificationFailed(
  notification: INotificationDocument | null,
  data?: Record<string, unknown>,
) {
  if (!notification) return;
  notification.status = 'failed';
  notification.sentAt = new Date();
  if (data) notification.data = { ...(notification.data ?? {}), ...data };
  await notification.save();
}

async function markNotificationSent(
  notification: INotificationDocument | null,
  messageId?: string,
) {
  if (!notification) return;
  notification.status = 'sent';
  notification.sentAt = new Date();
  if (messageId) notification.resendMessageId = messageId;
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

  // ── SMTP path (nodemailer) ────────────────────────────────────────────────
  if (smtpTransport) {
    try {
      const info = await smtpTransport.sendMail({
        from: env.EMAIL_FROM,
        to: input.to,
        subject: input.subject,
        html: input.html,
      });
      await markNotificationSent(notification, info.messageId);
      logger.info({ to: input.to, subject: input.subject, messageId: info.messageId }, 'Email sent via SMTP');
      return { delivered: true };
    } catch (err) {
      logger.warn({ err, to: input.to, subject: input.subject }, 'SMTP send failed; logging email preview');
      await markNotificationFailed(notification, {
        emailFallback: 'smtp_failed',
        previewUrl: input.previewUrl,
        reason: err instanceof Error ? err.message : 'unknown',
      });
      // Log email content so admin can see it even when SMTP is misconfigured
      logger.info({ to: input.to, subject: input.subject, previewUrl: input.previewUrl, html: input.html }, 'EMAIL PREVIEW (SMTP failed)');
      return { delivered: false, previewUrl: input.previewUrl };
    }
  }

  // ── Resend fallback ───────────────────────────────────────────────────────
  if (!resendClient || isPlaceholderResendKey) {
    logger.warn(
      { to: input.to, subject: input.subject, previewUrl: input.previewUrl },
      'No email transport configured; logging email preview',
    );
    logger.info({ to: input.to, subject: input.subject, previewUrl: input.previewUrl, html: input.html }, 'EMAIL PREVIEW (no transport)');
    await markNotificationFailed(notification, {
      emailFallback: 'no_transport',
      previewUrl: input.previewUrl,
    });
    return { delivered: false, previewUrl: input.previewUrl };
  }

  try {
    const result = await resendClient.emails.send({
      from: env.EMAIL_FROM,
      to: input.to,
      subject: input.subject,
      html: input.html,
    });
    const resendMessageId = (result as { data?: { id?: string } }).data?.id;
    const resendError = (result as { error?: { message?: string } }).error;
    if (resendError) throw new Error(resendError.message ?? 'Resend API error');
    await markNotificationSent(notification, resendMessageId);
    return { delivered: true };
  } catch (err) {
    logger.warn({ err, to: input.to, previewUrl: input.previewUrl }, 'Resend failed');
    await markNotificationFailed(notification);
    return { delivered: false, previewUrl: input.previewUrl };
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
