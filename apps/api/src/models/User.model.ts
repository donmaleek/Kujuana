import { Schema, model, type Document, type Model, type CallbackError } from 'mongoose';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import type { UserRole } from '@kujuana/shared';

const USER_ROLE_VALUES: UserRole[] = ['member', 'admin', 'manager', 'matchmaker'];
const BCRYPT_HASH_PREFIX = /^\$2[aby]\$\d{2}\$/;

export interface IUserDocument extends Document {
  fullName: string;
  email: string;
  phone?: string;
  passwordHash: string;
  role: UserRole;
  roles: UserRole[];
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  refreshTokens: string[];
  emailVerifyToken?: string;
  emailVerifyExpiry?: Date;
  passwordResetToken?: string;
  passwordResetExpiry?: Date;
  isActive: boolean;
  isSuspended: boolean;
  suspendedReason?: string;
  lastLoginAt?: Date;
  loginAttempts: number;
  lockUntil?: Date;
  comparePassword(plain: string): Promise<boolean>;
  generateEmailVerifyToken(): string;
  generatePasswordResetToken(): string;
  isLocked(): boolean;
}

interface IUserModel extends Model<IUserDocument> {
  findByEmail(email: string): Promise<IUserDocument | null>;
}

const userSchema = new Schema<IUserDocument, IUserModel>(
  {
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
      minlength: [2, 'Full name must be at least 2 characters'],
      maxlength: [100, 'Full name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please provide a valid email address'],
    },
    phone: {
      type: String,
      trim: true,
      sparse: true,
      match: [/^\+[1-9]\d{7,14}$/, 'Phone must be in E.164 format (+254...)'],
    },
    passwordHash: {
      type: String,
      required: [true, 'Password is required'],
      select: false,
    },
    role: {
      type: String,
      enum: USER_ROLE_VALUES,
      default: 'member',
    },
    roles: {
      type: [String],
      enum: USER_ROLE_VALUES,
      default: ['member'],
    },
    isEmailVerified: { type: Boolean, default: false },
    isPhoneVerified: { type: Boolean, default: false },
    refreshTokens: {
      type: [String],
      default: [],
      select: false,
    },
    emailVerifyToken: { type: String, select: false },
    emailVerifyExpiry: { type: Date, select: false },
    passwordResetToken: { type: String, select: false },
    passwordResetExpiry: { type: Date, select: false },
    isActive: { type: Boolean, default: true },
    isSuspended: { type: Boolean, default: false },
    suspendedReason: { type: String },
    lastLoginAt: { type: Date },
    loginAttempts: { type: Number, default: 0, select: false },
    lockUntil: { type: Date, select: false },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

userSchema.index({ role: 1 });
userSchema.index({ createdAt: -1 });
userSchema.index({ isActive: 1, isSuspended: 1 });
userSchema.index({ roles: 1 });

userSchema.pre('validate', function syncRoles(next) {
  if (this.role && (!Array.isArray(this.roles) || this.roles.length === 0)) {
    this.roles = [this.role];
    next();
    return;
  }

  if (Array.isArray(this.roles) && this.roles.length > 0) {
    const primaryRole = this.roles[0];
    if (primaryRole) this.role = primaryRole;
  }

  next();
});

userSchema.pre('save', async function hashPassword(next) {
  if (!this.isModified('passwordHash')) {
    next();
    return;
  }

  try {
    if (!BCRYPT_HASH_PREFIX.test(this.passwordHash)) {
      const salt = await bcrypt.genSalt(12);
      this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
    }
    next();
  } catch (err) {
    next(err as CallbackError);
  }
});

userSchema.pre('save', function capRefreshTokens(next) {
  if (Array.isArray(this.refreshTokens) && this.refreshTokens.length > 5) {
    this.refreshTokens = this.refreshTokens.slice(-5);
  }
  next();
});

userSchema.methods.comparePassword = async function comparePassword(
  plain: string,
): Promise<boolean> {
  return bcrypt.compare(plain, this.passwordHash);
};

userSchema.methods.generateEmailVerifyToken = function generateEmailVerifyToken(): string {
  const rawToken = crypto.randomBytes(32).toString('hex');
  this.emailVerifyToken = crypto.createHash('sha256').update(rawToken).digest('hex');
  this.emailVerifyExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);
  return rawToken;
};

userSchema.methods.generatePasswordResetToken = function generatePasswordResetToken(): string {
  const rawToken = crypto.randomBytes(32).toString('hex');
  this.passwordResetToken = crypto.createHash('sha256').update(rawToken).digest('hex');
  this.passwordResetExpiry = new Date(Date.now() + 60 * 60 * 1000);
  return rawToken;
};

userSchema.methods.isLocked = function isLocked(): boolean {
  return Boolean(this.lockUntil && this.lockUntil > new Date());
};

userSchema.statics.findByEmail = function findByEmail(email: string) {
  return this.findOne({ email: email.toLowerCase().trim() });
};

userSchema.set('toJSON', {
  transform: (_doc, ret: any) => {
    delete ret.passwordHash;
    delete ret.refreshTokens;
    delete ret.emailVerifyToken;
    delete ret.emailVerifyExpiry;
    delete ret.passwordResetToken;
    delete ret.passwordResetExpiry;
    delete ret.loginAttempts;
    delete ret.lockUntil;
    return ret;
  },
});

export const User = model<IUserDocument, IUserModel>('User', userSchema);
