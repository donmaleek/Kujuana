import { Resend } from 'resend';
import { env } from '../../config/env.js';
import { logger } from '../../config/logger.js';

const resend = new Resend(env.RESEND_API_KEY);

export const emailService = {
  async sendVerification(to: string, token: string): Promise<void> {
    const link = `${env.WEB_BASE_URL}/verify-email?token=${token}`;
    await resend.emails.send({
      from: env.EMAIL_FROM,
      to,
      subject: 'Verify your Kujuana email',
      html: `<p>Click <a href="${link}">here</a> to verify your email. Link expires in 15 minutes.</p>`,
    });
    logger.info({ to }, 'Verification email sent');
  },

  async sendPasswordReset(to: string, token: string): Promise<void> {
    const link = `${env.WEB_BASE_URL}/reset-password?token=${token}`;
    await resend.emails.send({
      from: env.EMAIL_FROM,
      to,
      subject: 'Reset your Kujuana password',
      html: `<p>Click <a href="${link}">here</a> to reset your password. Link expires in 15 minutes.</p>`,
    });
  },

  async sendMatchNotification(to: string, matchId: string): Promise<void> {
    const link = `${env.WEB_BASE_URL}/matches/${matchId}`;
    await resend.emails.send({
      from: env.EMAIL_FROM,
      to,
      subject: "You have a new match on Kujuana",
      html: `<p>You have a new match! <a href="${link}">View your match</a>.</p>`,
    });
  },

  async sendPaymentReceipt(to: string, amount: number, currency: string): Promise<void> {
    await resend.emails.send({
      from: env.EMAIL_FROM,
      to,
      subject: 'Kujuana payment confirmation',
      html: `<p>Your payment of ${currency} ${amount} has been received. Thank you for subscribing to Kujuana.</p>`,
    });
  },
};
