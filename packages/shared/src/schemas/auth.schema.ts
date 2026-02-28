import { z } from 'zod';

const E164_PHONE_REGEX = /^\+[1-9]\d{7,14}$/;

function normalizePhoneForAuth(raw: string): string {
  const compact = raw.replace(/[\s()-]/g, '');

  if (compact.startsWith('+')) return compact;
  if (compact.startsWith('00')) return `+${compact.slice(2)}`;

  // Kujuana is Kenya-first: accept common local forms and normalize to E.164.
  if (/^0\d{9}$/.test(compact)) return `+254${compact.slice(1)}`;
  if (/^254\d{9}$/.test(compact)) return `+${compact}`;
  if (/^7\d{8}$/.test(compact)) return `+254${compact}`;

  return compact;
}

export const registerSchema = z.object({
  fullName: z.string().min(2).max(100),
  email: z.string().email(),
  phone: z
    .string()
    .transform(normalizePhoneForAuth)
    .refine((value) => E164_PHONE_REGEX.test(value), 'Must be E.164 format (e.g. +254712345678)'),
  password: z
    .string()
    .min(8)
    .regex(/[A-Z]/, 'Must contain uppercase')
    .regex(/[0-9]/, 'Must contain number'),
  agreedToTerms: z
    .boolean()
    .refine((value) => value, 'You must agree to the Terms of Service and Privacy Policy'),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const verifyEmailSchema = z.object({
  token: z.string().min(1),
  email: z.string().email().optional(),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1),
  password: z
    .string()
    .min(8)
    .regex(/[A-Z]/, 'Must contain uppercase')
    .regex(/[0-9]/, 'Must contain number'),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
