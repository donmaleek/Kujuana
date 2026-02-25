import { z } from 'zod';
import { step2BasicSchema, step3BackgroundSchema, step5VisionSchema, step6PreferencesSchema } from './onboarding.schema.js';

export const updateProfileSchema = z.object({
  basic: step2BasicSchema.partial().optional(),
  background: step3BackgroundSchema.partial().optional(),
  vision: step5VisionSchema.partial().optional(),
  preferences: step6PreferencesSchema.partial().optional(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
