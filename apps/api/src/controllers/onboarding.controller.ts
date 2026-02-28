import type { Request, Response, NextFunction } from 'express';
import { Profile } from '../models/Profile.model.js';
import { AppError } from '../middleware/error.middleware.js';
import { subscriptionRepo } from '../repositories/subscription.repo.js';
import { Payment } from '../models/Payment.model.js';
import { setProfileCompletionCookies } from '../utils/cookies.js';
import {
  step1PlanSchema,
  step2BasicSchema,
  step3BackgroundSchema,
  step5VisionSchema,
  step6PreferencesSchema,
} from '@kujuana/shared';
import { z } from 'zod';

const step4PhotosSchema = z
  .union([
    z.array(
      z.object({
        publicId: z.string().min(1),
        order: z.number().int().min(1),
        isPrivate: z.boolean().optional(),
      }),
    ),
    z.object({
      photos: z.array(
        z.object({
          publicId: z.string().min(1),
          order: z.number().int().min(1),
          isPrivate: z.boolean().optional(),
        }),
      ),
    }),
  ])
  .transform((value) => (Array.isArray(value) ? value : value.photos));

const STEP_CONFIG = {
  1: { key: 'plan', schema: step1PlanSchema },
  2: { key: 'basic', schema: step2BasicSchema },
  3: { key: 'background', schema: step3BackgroundSchema },
  4: { key: 'photos', schema: step4PhotosSchema },
  5: { key: 'vision', schema: step5VisionSchema },
  6: { key: 'preferences', schema: step6PreferencesSchema },
} as const;

type PlanTier = 'standard' | 'priority' | 'vip';

const TIER_RANK: Record<PlanTier, number> = {
  standard: 1,
  priority: 2,
  vip: 3,
};

function normalizePlanTier(value: unknown): PlanTier {
  const tier = typeof value === 'string' ? value.trim().toLowerCase() : '';
  if (tier === 'priority' || tier === 'vip') return tier;
  return 'standard';
}

function tierSatisfiesRequirement(current: PlanTier, required: PlanTier): boolean {
  return TIER_RANK[current] >= TIER_RANK[required];
}

function getEligiblePaidTiers(required: PlanTier): PlanTier[] {
  if (required === 'vip') return ['vip'];
  if (required === 'priority') return ['priority', 'vip'];
  return [];
}

function parseStringArray(value: unknown, delimiter = ','): string[] {
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }
  if (typeof value === 'string') {
    return value
      .split(delimiter)
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return [];
}

function parseAgeToDateOfBirth(ageInput: unknown): Date | undefined {
  const age = Number.parseInt(String(ageInput ?? ''), 10);
  if (!Number.isFinite(age) || age < 18 || age > 100) return undefined;
  const now = new Date();
  return new Date(now.getFullYear() - age, now.getMonth(), now.getDate());
}

export const onboardingController = {
  async getProgress(req: Request, res: Response, next: NextFunction) {
    try {
      const profile = await Profile.findOne({ userId: req.user!.userId });
      res.json({
        currentStep: profile?.onboardingStep ?? 1,
        data: {
          plan: (profile?.basic as Record<string, unknown> | undefined)?.plan,
          basic: profile?.basic ?? {},
          background: profile?.background ?? {},
          vision: profile?.vision ?? {},
          preferences: profile?.preferences ?? {},
          photos: profile?.photos ?? [],
        },
        completeness: profile?.completeness ?? { overall: 0 },
      });
    } catch (err) {
      next(err);
    }
  },

  async saveStep(req: Request, res: Response, next: NextFunction) {
    try {
      const stepParam = req.params['step'];
      const stepValue = Array.isArray(stepParam) ? stepParam[0] : stepParam;
      const step = parseInt(stepValue ?? '0', 10);
      const stepConfig = STEP_CONFIG[step as keyof typeof STEP_CONFIG];
      if (!stepConfig) return next(new AppError('Invalid step', 400));

      const normalizedBody =
        step === 1 &&
        req.body &&
        typeof req.body === 'object' &&
        !Array.isArray(req.body) &&
        'plan' in req.body &&
        !('tier' in req.body)
          ? { ...(req.body as Record<string, unknown>), tier: (req.body as Record<string, unknown>)['plan'] }
          : req.body;

      const parsed = stepConfig.schema.safeParse(normalizedBody);
      if (!parsed.success) {
        return next(parsed.error);
      }

      let profile = await Profile.findOne({ userId: req.user!.userId });
      if (!profile) {
        profile = await Profile.create({ userId: req.user!.userId });
      }

      if (stepConfig.key === 'photos') {
        const stepPhotos = parsed.data as Array<{
          publicId: string;
          order: number;
          isPrivate?: boolean;
        }>;

        const photos = stepPhotos
          .map((p) => ({
            publicId: p.publicId,
            order: p.order,
            isPrivate: p.isPrivate ?? true,
            isPrimary: false,
          }))
          .sort((a, b) => a.order - b.order)
          .map((p, i) => ({ ...p, isPrimary: i === 0 }));
        profile.photos = photos as any;
      } else if (stepConfig.key === 'plan') {
        const stepPlan = parsed.data as { tier: PlanTier };
        profile.basic = {
          ...(profile.basic ?? {}),
          plan: stepPlan.tier,
        } as Record<string, unknown>;
      } else {
        (profile as any)[stepConfig.key] = parsed.data;
      }

      profile.onboardingStep = Math.max(profile.onboardingStep ?? 1, step);
      await profile.save();

      res.json({ message: 'Step saved', completeness: profile.completeness });
    } catch (err) {
      next(err);
    }
  },

  async submit(req: Request, res: Response, next: NextFunction) {
    try {
      let profile = await Profile.findOne({ userId: req.user!.userId });
      if (!profile) {
        profile = await Profile.create({ userId: req.user!.userId });
      }

      const payload = (req.body ?? {}) as Record<string, any>;

      // Support the web onboarding flow that submits the whole draft in step 7.
      const selectedPlan = normalizePlanTier(
        payload.plan ?? (profile.basic as Record<string, unknown> | undefined)?.plan,
      );
      const plan = selectedPlan;
      const basicDetails = (payload.basicDetails ?? payload.basic ?? {}) as Record<string, unknown>;
      const background = (payload.background ?? {}) as Record<string, unknown>;
      const vision = (payload.vision ?? {}) as Record<string, unknown>;
      const preferences = (payload.preferences ?? {}) as Record<string, unknown>;

      const activeSubscription = await subscriptionRepo.findActiveByUserId(req.user!.userId);
      const subscriptionTier = normalizePlanTier(activeSubscription?.tier);
      const hasEligibleSubscription =
        Boolean(activeSubscription) && tierSatisfiesRequirement(subscriptionTier, selectedPlan);
      const requiresPayment = selectedPlan !== 'standard';

      if (requiresPayment && !hasEligibleSubscription) {
        const eligibleTiers = getEligiblePaidTiers(selectedPlan);

        const hasCompletedPayment = await Payment.exists({
          userId: req.user!.userId,
          status: 'completed',
          'metadata.tier': { $in: eligibleTiers },
        });

        if (!hasCompletedPayment) {
          const hasPendingPayment = await Payment.exists({
            userId: req.user!.userId,
            status: 'pending',
            'metadata.tier': { $in: eligibleTiers },
          });

          if (hasPendingPayment) {
            return next(
              new AppError(
                'Payment is still processing. Wait for confirmation before submitting.',
                409,
                'PAYMENT_PENDING',
              ),
            );
          }

          return next(
            new AppError(
              'Payment is required before profile submission. Complete payment and try again.',
              402,
              'PAYMENT_REQUIRED',
            ),
          );
        }
      }

      const [city = '', country = ''] =
        typeof basicDetails['location'] === 'string'
          ? String(basicDetails['location']).split(',').map((part) => part.trim())
          : [String((basicDetails['city'] ?? '')).trim(), String((basicDetails['country'] ?? '')).trim()];

      profile.basic = {
        ...(profile.basic ?? {}),
        plan,
        fullName: basicDetails['fullName'],
        gender: String(basicDetails['gender'] ?? '').toLowerCase().includes('f') ? 'female' : 'male',
        dateOfBirth: parseAgeToDateOfBirth(basicDetails['age']) ?? profile.dateOfBirth,
        city,
        country,
        occupation: background['work'] ?? profile.occupation,
        religion: background['faith'] ?? profile.religion,
      } as Record<string, unknown>;

      profile.background = {
        ...(profile.background ?? {}),
        personalityTraits: parseStringArray(background['lifestyle']),
        wantsChildren: String(background['kids'] ?? ''),
        childrenStatus: String(background['kids'] ?? '').toLowerCase().includes('none')
          ? 'none'
          : 'have_and_want_more',
        smoking: 'never',
        drinking: 'never',
        diet: 'omnivore',
        exercise: 'occasionally',
      } as Record<string, unknown>;

      profile.vision = {
        ...(profile.vision ?? {}),
        relationshipType: 'serious',
        coreValues: parseStringArray(vision['values']),
        idealPartnerDescription: String(vision['intention'] ?? ''),
        lifeVision: String(vision['intention'] ?? ''),
        nonNegotiables: parseStringArray(vision['nonNegotiables']),
        emotionalReadiness: 'ready',
      } as Record<string, unknown>;

      profile.preferences = {
        ...(profile.preferences ?? {}),
        ageRange: {
          min: Number.parseInt(String(preferences['ageMin'] ?? '24'), 10) || 24,
          max: Number.parseInt(String(preferences['ageMax'] ?? '35'), 10) || 35,
        },
        countries: parseStringArray(preferences['preferredLocation']),
        religions: [],
        openToInternational: false,
        lifestylePreferences: parseStringArray(preferences['dealBreakers']),
      } as any;

      const uploadedPhotos = Array.isArray(payload.photos) ? payload.photos : [];
      if (uploadedPhotos.length > 0) {
        profile.photos = uploadedPhotos.slice(0, 6).map((photo: any, index: number) => ({
          publicId: String(photo.publicId ?? photo.name ?? `local-photo-${index + 1}`),
          url: typeof photo.previewUrl === 'string' ? photo.previewUrl : undefined,
          isPrimary: index === 0,
          isPrivate: true,
          order: index + 1,
        })) as any;
      }

      profile.onboardingStep = 6;
      profile.onboardingComplete = true;
      profile.isActive = true;
      profile.isSubmitted = true;
      profile.submittedAt = new Date();

      await profile.save();
      setProfileCompletionCookies(res, true);

      res.json({
        message: 'Profile submitted successfully',
        completeness: profile.completeness,
      });
    } catch (err) {
      next(err);
    }
  },
};
