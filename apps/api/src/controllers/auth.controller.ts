import type { Request, Response, NextFunction } from 'express';
import { register, login } from '../services/auth/auth.service.js';
import { generateOtp, verifyOtp } from '../services/auth/otp.service.js';
import { User } from '../models/User.model.js';
import { AppError } from '../middleware/error.middleware.js';
import {
  clearAccessTokenCookies,
  clearProfileCompletionCookies,
  clearRefreshTokenCookie,
  clearRoleCookies,
  setAccessTokenCookies,
  setProfileCompletionCookies,
  setRefreshTokenCookie,
  setRoleCookies,
} from '../utils/cookies.js';
import { resolveDeviceId } from '../utils/device.js';
import { DeviceSession } from '../models/DeviceSession.model.js';
import { Profile } from '../models/Profile.model.js';
import { Subscription } from '../models/Subscription.model.js';
import { emailService } from '../services/email/email.service.js';
import { hashPassword } from '../services/auth/password.service.js';
import { createHash } from 'crypto';
import { logger } from '../config/logger.js';
import type { UserRole } from '@kujuana/shared';

function mapRoleForClient(input: { role?: UserRole; roles?: UserRole[] }): 'admin' | 'manager' | 'matchmaker' | 'user' {
  const roles = Array.isArray(input.roles) ? input.roles : [];
  if (roles.includes('admin') || input.role === 'admin') return 'admin';
  if (roles.includes('manager') || input.role === 'manager') return 'manager';
  if (roles.includes('matchmaker') || input.role === 'matchmaker') return 'matchmaker';
  return 'user';
}

async function buildSessionPayload(userId: string) {
  const [user, profile, subscription] = await Promise.all([
    User.findById(userId).select('fullName email roles role isEmailVerified'),
    Profile.findOne({ userId }).select('onboardingComplete completeness'),
    Subscription.findOne({ userId }).sort({ createdAt: -1 }).select('tier priorityCredits'),
  ]);

  if (!user) throw new AppError('User not found', 404);

  const role = mapRoleForClient({ role: user.role, roles: user.roles });
  const profileCompleted = Boolean(profile?.onboardingComplete || (profile?.completeness?.overall ?? 0) >= 100);

  return {
    user,
    session: {
      id: user._id.toString(),
      userId: user._id.toString(),
      email: user.email,
      fullName: user.fullName,
      role,
      tier: subscription?.tier ?? 'standard',
      credits: subscription?.priorityCredits ?? 0,
      profileCompleted,
      isEmailVerified: user.isEmailVerified,
    },
  };
}

export const authController = {
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await register(req.body);
      res.status(201).json(result);
    } catch (err) {
      next(err);
    }
  },

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const deviceId = resolveDeviceId(req);
      const result = await login(req.body, deviceId);
      const { session } = await buildSessionPayload(result.userId);

      setRefreshTokenCookie(res, result.refreshToken);
      setAccessTokenCookies(res, result.accessToken);
      setRoleCookies(res, session.role);
      setProfileCompletionCookies(res, session.profileCompleted);

      res.json({
        accessToken: result.accessToken,
        userId: result.userId,
        user: session,
      });
    } catch (err) {
      next(err);
    }
  },

  async me(req: Request, res: Response, next: NextFunction) {
    try {
      const { session } = await buildSessionPayload(req.user!.userId);
      setRoleCookies(res, session.role);
      setProfileCompletionCookies(res, session.profileCompleted);
      res.json(session);
    } catch (err) {
      next(err);
    }
  },

  async verifyEmail(req: Request, res: Response, next: NextFunction) {
    try {
      const { token, email } = req.body as { token: string; email?: string };
      const normalizedEmail = email?.toLowerCase().trim();
      const user = normalizedEmail
        ? await User.findOne({ email: normalizedEmail })
        : null;
      if (!user) return next(new AppError('User not found', 404));

      const valid = await verifyOtp('email', user.email, token);
      if (!valid) return next(new AppError('Invalid or expired token', 400));

      user.isEmailVerified = true;
      await user.save();
      res.json({ message: 'Email verified' });
    } catch (err) {
      next(err);
    }
  },

  async resendVerification(req: Request, res: Response, next: NextFunction) {
    try {
      const email = (req.body?.email as string | undefined)?.toLowerCase().trim();
      if (!email) return next(new AppError('Email is required', 400));

      const user = await User.findOne({ email });
      if (!user) {
        // Avoid account enumeration.
        return res.json({ message: 'If this account exists, verification email has been sent.' });
      }
      if (user.isEmailVerified) {
        return res.json({ message: 'Email is already verified.' });
      }

      const token = await generateOtp('email', user.email);
      const verification = await emailService.sendVerification(user.email, token, { userId: user._id.toString() });

      res.json({
        message: verification.delivered
          ? 'Verification email sent.'
          : 'Verification email could not be delivered; development preview link generated.',
        verification,
      });
    } catch (err) {
      next(err);
    }
  },

  async forgotPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const email = (req.body?.email as string | undefined)?.toLowerCase().trim();
      if (!email) return next(new AppError('Email is required', 400));

      const user = await User.findOne({ email }).select('+passwordResetToken +passwordResetExpiry');
      if (user) {
        const resetToken = user.generatePasswordResetToken();
        await user.save();

        try {
          await emailService.sendPasswordReset(user.email, resetToken, {
            userId: user._id.toString(),
          });
        } catch (err) {
          logger.error({ err, userId: user._id.toString() }, 'Failed to send password reset email');
        }
      }

      // Avoid account enumeration.
      res.json({ message: 'If this account exists, a reset link has been sent.' });
    } catch (err) {
      next(err);
    }
  },

  async resetPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { token, password } = req.body as { token?: string; password?: string };
      if (!token || !password) return next(new AppError('Token and password are required', 400));

      const hashedToken = createHash('sha256').update(token).digest('hex');
      const user = await User.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpiry: { $gt: new Date() },
      }).select('+passwordHash +passwordResetToken +passwordResetExpiry');

      if (!user) return next(new AppError('Invalid or expired reset token', 400));

      user.passwordHash = await hashPassword(password);
      user.passwordResetToken = undefined;
      user.passwordResetExpiry = undefined;
      await user.save();

      res.json({ message: 'Password reset successful' });
    } catch (err) {
      next(err);
    }
  },

  async logout(req: Request, res: Response, next: NextFunction) {
    try {
      const deviceId = resolveDeviceId(req);
      const sessionExpiry = new Date();

      if (req.user?.userId) {
        await DeviceSession.findOneAndUpdate(
          { userId: req.user.userId, deviceId },
          { isRevoked: true, expiresAt: sessionExpiry },
        );
      } else {
        const refreshToken = typeof req.cookies?.refreshToken === 'string' ? req.cookies.refreshToken : '';
        if (refreshToken) {
          const refreshTokenHash = createHash('sha256').update(refreshToken).digest('hex');
          await DeviceSession.findOneAndUpdate(
            { refreshTokenHash },
            { isRevoked: true, expiresAt: sessionExpiry },
          );
        }
      }

      clearRefreshTokenCookie(res);
      clearAccessTokenCookies(res);
      clearRoleCookies(res);
      clearProfileCompletionCookies(res);

      if (String(req.headers.accept ?? '').includes('text/html')) {
        return res.redirect(302, '/');
      }

      res.json({ message: 'Logged out' });
    } catch (err) {
      next(err);
    }
  },
};
