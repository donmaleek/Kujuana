import { z } from 'zod';
import { SubscriptionTier } from '../enums/tiers.js';

export const initiatePaymentSchema = z.object({
  tier: z.nativeEnum(SubscriptionTier),
  gateway: z.enum(['pesapal', 'flutterwave']),
  currency: z.enum(['KES', 'USD']),
  returnUrl: z.string().url().optional(),
});

export type InitiatePaymentInput = z.infer<typeof initiatePaymentSchema>;
