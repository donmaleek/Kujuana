import { env } from '../config/env.js';
import { logger } from '../config/logger.js';
import { User } from '../models/User.model.js';
import { hashPassword } from '../services/auth/password.service.js';
import type { UserRole } from '@kujuana/shared';

async function ensurePrivilegedUser(opts: {
  email?: string;
  password?: string;
  fullName: string;
  phone: string;
  role: UserRole;
  label: string;
}) {
  const rawEmail = opts.email?.trim().toLowerCase();
  const rawPassword = opts.password ?? '';
  if (!rawEmail || !rawPassword) {
    logger.warn({ label: opts.label }, 'Privileged dev user credentials not configured; skipping');
    return;
  }

  const passwordHash = await hashPassword(rawPassword);
  const existing = await User.findOne({ email: rawEmail }).select('+passwordHash');

  if (!existing) {
    await User.create({
      fullName: opts.fullName,
      email: rawEmail,
      phone: opts.phone,
      passwordHash,
      role: opts.role,
      roles: [opts.role],
      isEmailVerified: true,
      isPhoneVerified: true,
    });
    logger.warn({ email: rawEmail, role: opts.role }, `Created development ${opts.label} account`);
    return;
  }

  const normalizedRoles = new Set<UserRole>(Array.isArray(existing.roles) ? existing.roles : []);
  normalizedRoles.add(opts.role);
  existing.fullName = opts.fullName;
  existing.phone = opts.phone;
  existing.passwordHash = passwordHash;
  existing.role = opts.role;
  existing.roles = [opts.role, ...Array.from(normalizedRoles).filter((role) => role !== opts.role)];
  existing.isEmailVerified = true;
  existing.isPhoneVerified = true;
  await existing.save();
}

export async function ensureDevAdmin(): Promise<void> {
  if (env.NODE_ENV === 'production') return;

  await ensurePrivilegedUser({
    email: env.DEV_ADMIN_EMAIL,
    password: env.DEV_ADMIN_PASSWORD,
    fullName: 'Kujuana Admin',
    phone: '+254700000001',
    role: 'admin',
    label: 'admin',
  });

  await ensurePrivilegedUser({
    email: env.DEV_MANAGER_EMAIL,
    password: env.DEV_MANAGER_PASSWORD,
    fullName: 'Kujuana Manager',
    phone: '+254700000002',
    role: 'manager',
    label: 'manager',
  });
}
