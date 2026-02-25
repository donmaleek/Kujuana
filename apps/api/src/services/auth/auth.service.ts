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
import { logger } from '../../config/logger.js';

const MAX_ACTIVE_SESSIONS = 5;
const MAX_LOGIN_ATTEMPTS = 5;
const LOGIN_LOCK_MS = 15 * 60 * 1000;

export async function register(input: RegisterInput) {
  const existing = await User.findOne({
    $or: [{ email: input.email }, { phone: input.phone }],
  });
  if (existing) {
    throw new AppError('Email or phone already registered', 409);
  }

  const passwordHash = await hashPassword(input.password);
  const user = await User.create({
    fullName: input.fullName,
    email: input.email,
    phone: input.phone,
    passwordHash,
    role: 'member',
    roles: ['member'],
  });

  // Create empty profile
  await Profile.create({ userId: user._id });

  // Send verification email — non-fatal: registration succeeds even if Redis/email is unavailable
  try {
    const token = await generateOtp('email', input.email);
    await emailService.sendVerification(input.email, token, {
      userId: user._id.toString(),
    });
  } catch (err) {
    logger.error({ err, email: input.email }, 'Failed to send verification email');
  }

  return {
    userId: user._id.toString(),
    message: 'Registration successful. Please verify your email.',
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

  user.loginAttempts = 0;
  user.lockUntil = undefined;
  user.lastLoginAt = new Date();
  await user.save();

  const jwtPayload = {
    userId: user._id.toString(),
    email: user.email,
    roles: (
      Array.isArray(user.roles) && user.roles.length > 0
        ? user.roles
        : [user.role]
    ) as any,
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
