import type { Request, Response, NextFunction } from 'express';
import { register, login } from '../services/auth/auth.service.js';
import { verifyOtp } from '../services/auth/otp.service.js';
import { User } from '../models/User.model.js';
import { AppError } from '../middleware/error.middleware.js';
import { setRefreshTokenCookie, clearRefreshTokenCookie } from '../utils/cookies.js';
import { resolveDeviceId } from '../utils/device.js';
import { DeviceSession } from '../models/DeviceSession.model.js';

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

      setRefreshTokenCookie(res, result.refreshToken);

      res.json({ accessToken: result.accessToken, userId: result.userId });
    } catch (err) {
      next(err);
    }
  },

  async verifyEmail(req: Request, res: Response, next: NextFunction) {
    try {
      const { token } = req.body as { token: string };
      const user = await User.findOne({ email: req.body.email });
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

  async logout(req: Request, res: Response, next: NextFunction) {
    try {
      const deviceId = resolveDeviceId(req);
      await DeviceSession.findOneAndUpdate(
        { userId: req.user!.userId, deviceId },
        { isRevoked: true, expiresAt: new Date() },
      );
      clearRefreshTokenCookie(res);
      res.json({ message: 'Logged out' });
    } catch (err) {
      next(err);
    }
  },
};
