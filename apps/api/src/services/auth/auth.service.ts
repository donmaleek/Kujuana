import { User } from '../../models/User.model.js';
import { Profile } from '../../models/Profile.model.js';
import { hashPassword, verifyPassword } from './password.service.js';
import { signAccessToken, signRefreshToken } from './jwt.service.js';
import { generateOtp } from './otp.service.js';
import { AppError } from '../../middleware/error.middleware.js';
import { DeviceSession } from '../../models/DeviceSession.model.js';
import { createHash } from 'crypto';
import { env } from '../../config/env.js';
import type { RegisterInput, LoginInput } from '@kujuana/shared';

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
    roles: ['member'],
  });

  // Create empty profile
  await Profile.create({ userId: user._id });

  // Send verification email
  const token = await generateOtp('email', input.email);
  // TODO: await emailService.sendVerification(input.email, token);

  return {
    userId: user._id.toString(),
    message: 'Registration successful. Please verify your email.',
  };
}

export async function login(input: LoginInput, deviceId: string) {
  const user = await User.findOne({ email: input.email });
  if (!user) throw new AppError('Invalid credentials', 401);
  if (user.isSuspended) throw new AppError('Account suspended', 403);

  const valid = await verifyPassword(input.password, user.passwordHash);
  if (!valid) throw new AppError('Invalid credentials', 401);

  const jwtPayload = {
    userId: user._id.toString(),
    email: user.email,
    roles: user.roles as any,
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

  return { accessToken, refreshToken, userId: user._id.toString() };
}
