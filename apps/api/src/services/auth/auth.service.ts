import { User } from '../../models/User.model.js';
import { Profile } from '../../models/Profile.model.js';
import { hashPassword, verifyPassword } from './password.service.js';
import { signAccessToken, signRefreshToken } from './jwt.service.js';
import { generateOtp } from './otp.service.js';
import { AppError } from '../../middleware/error.middleware.js';
import { DeviceSession } from '../../models/DeviceSession.model.js';
import { createHash } from 'crypto';
import type { RegisterInput, LoginInput } from '@kujuana/shared';
import { emailService } from '../email/email.service.js';
import type { EmailDispatchResult } from '../email/email.service.js';
import { logger } from '../../config/logger.js';
import { env } from '../../config/env.js';
import type { UserRole } from '@kujuana/shared';

const MAX_ACTIVE_SESSIONS = 5;
const MAX_LOGIN_ATTEMPTS = 5;
const LOGIN_LOCK_MS = 15 * 60 * 1000;
const ROLE_PRIORITY: UserRole[] = ['admin', 'manager', 'matchmaker', 'member'];

function resolveUserRoles(input: { role?: UserRole; roles?: UserRole[] }): UserRole[] {
  const existing = Array.isArray(input.roles) ? input.roles : [];
  const merged = new Set<UserRole>();

  if (input.role && ROLE_PRIORITY.includes(input.role)) {
    merged.add(input.role);
  }
  for (const role of existing) {
    if (ROLE_PRIORITY.includes(role)) merged.add(role);
  }
  if (merged.size === 0) merged.add('member');

  return ROLE_PRIORITY.filter((role) => merged.has(role));
}

export async function register(input: RegisterInput) {
  const email = input.email.toLowerCase().trim();
  const phone = input.phone.trim();

  const existing = await User.findOne({
    $or: [{ email }, { phone }],
  });
  if (existing) {
    throw new AppError('Email or phone already registered', 409);
  }

  let verificationToken: string;
  try {
    verificationToken = await generateOtp('email', email);
  } catch (err) {
    logger.error({ err, email }, 'Failed to create verification token');
    throw new AppError('Verification service is temporarily unavailable. Please try again.', 503, 'VERIFICATION_UNAVAILABLE');
  }

  const passwordHash = await hashPassword(input.password);
  const user = await User.create({
    fullName: input.fullName,
    email,
    phone,
    passwordHash,
    role: 'member',
    roles: ['member'],
  });

  // Create empty profile
  await Profile.create({ userId: user._id });

  // Send verification email; in development we may return a preview link if delivery is unavailable.
  let verification: EmailDispatchResult = { delivered: false };
  try {
    verification = await emailService.sendVerification(email, verificationToken, {
      userId: user._id.toString(),
    });
  } catch (err) {
    logger.error({ err, email }, 'Failed to send verification email');
  }

  // In local/dev flows where provider delivery is unavailable, avoid blocking sign-in.
  if (!verification.delivered && env.NODE_ENV !== 'production') {
    user.isEmailVerified = true;
    await user.save();
  }

  return {
    userId: user._id.toString(),
    message: !verification.delivered && env.NODE_ENV !== 'production'
      ? 'Registration successful. Your email was auto-verified for development.'
      : verification.delivered
      ? 'Registration successful. Please verify your email.'
      : 'Registration successful. Verification email could not be delivered; use resend or the development preview link.',
    verification,
  };
}

export async function login(input: LoginInput, deviceId: string) {
  const normalizedEmail = input.email.toLowerCase().trim();
  const user = await User.findOne({ email: normalizedEmail })
    .select('+passwordHash +loginAttempts +lockUntil');
  if (!user) throw new AppError('Invalid credentials', 401);
  if (!user.isActive) throw new AppError('Account is inactive', 403);
  if (user.isSuspended) throw new AppError('Account suspended', 403);
  if (user.isLocked()) throw new AppError('Account is temporarily locked', 423);

  const valid = await verifyPassword(input.password, user.passwordHash);
  if (!valid) {
    user.loginAttempts = (user.loginAttempts ?? 0) + 1;
    if (user.loginAttempts >= MAX_LOGIN_ATTEMPTS) {
      user.loginAttempts = 0;
      user.lockUntil = new Date(Date.now() + LOGIN_LOCK_MS);
    }
    await user.save();
    throw new AppError('Invalid credentials', 401);
  }

  if (!user.isEmailVerified) {
    throw new AppError('Email not verified. Please verify your email before signing in.', 403, 'EMAIL_NOT_VERIFIED');
  }

  user.loginAttempts = 0;
  user.lockUntil = undefined;
  user.lastLoginAt = new Date();

  const resolvedRoles = resolveUserRoles({ role: user.role, roles: user.roles });
  const resolvedPrimaryRole = resolvedRoles[0] ?? 'member';
  const rolesChanged =
    !Array.isArray(user.roles) ||
    user.roles.length !== resolvedRoles.length ||
    user.roles.some((role, idx) => role !== resolvedRoles[idx]) ||
    user.role !== resolvedPrimaryRole;

  if (rolesChanged) {
    user.roles = resolvedRoles;
    user.role = resolvedPrimaryRole;
  }

  await user.save();

  const jwtPayload = {
    userId: user._id.toString(),
    email: user.email,
    roles: resolvedRoles,
  };

  const accessToken = signAccessToken(jwtPayload);
  const refreshToken = signRefreshToken(jwtPayload);

  const tokenHash = createHash('sha256').update(refreshToken).digest('hex');
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

  await DeviceSession.findOneAndUpdate(
    { userId: user._id, deviceId },
    { refreshTokenHash: tokenHash, expiresAt, isRevoked: false, lastUsedAt: new Date() },
    { upsert: true, new: true },
  );

  const activeSessions = await DeviceSession.find({ userId: user._id, isRevoked: false })
    .sort({ lastUsedAt: -1 })
    .select('_id')
    .lean();
  if (activeSessions.length > MAX_ACTIVE_SESSIONS) {
    const staleSessionIds = activeSessions.slice(MAX_ACTIVE_SESSIONS).map((session) => session._id);
    await DeviceSession.updateMany(
      { _id: { $in: staleSessionIds } },
      { isRevoked: true, expiresAt: new Date() },
    );
  }

  return { accessToken, refreshToken, userId: user._id.toString() };
}
