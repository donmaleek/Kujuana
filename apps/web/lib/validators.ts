// kujuana/apps/web/lib/validators.ts
import { z } from "zod";

export const phoneE164 = z
  .string()
  .min(8)
  .max(20)
  .refine((v) => /^\+?[0-9]{8,20}$/.test(v.replace(/\s/g, "")), "Invalid phone number.");

export const emailSchema = z.string().email("Invalid email.");

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(8, "Password must be at least 8 characters."),
});

export const registerSchema = z.object({
  email: emailSchema,
  password: z.string().min(8),
  fullName: z.string().min(2),
});

export const paymentInitiateSchema = z.object({
  method: z.enum(["mpesa", "paystack", "pesapal", "flutterwave"]),
  phone: phoneE164.optional(),
  purpose: z.string().min(2),
});
