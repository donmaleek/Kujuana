import type { Request, Response, NextFunction } from 'express';
import { Profile } from '../models/Profile.model.js';
import { AppError } from '../middleware/error.middleware.js';
import { User } from '../models/User.model.js';
import { Subscription } from '../models/Subscription.model.js';

function toStringArray(value: unknown, delimiter = ','): string[] {
  if (Array.isArray(value)) return value.map((v) => String(v).trim()).filter(Boolean);
  if (typeof value === 'string') {
    return value
      .split(delimiter)
      .map((v) => v.trim())
      .filter(Boolean);
  }
  return [];
}

async function buildProfileResponse(userId: string) {
  const [profile, user, subscription] = await Promise.all([
    Profile.findOne({ userId }),
    User.findById(userId).select('fullName email'),
    Subscription.findOne({ userId }).sort({ createdAt: -1 }).select('tier priorityCredits status'),
  ]);

  if (!profile) return null;

  const locationLabel =
    profile.location?.city && profile.location?.country
      ? `${profile.location.city}, ${profile.location.country}`
      : profile.location?.city || profile.location?.country || '';

  const settings = ((profile.basic as Record<string, unknown> | undefined)?.['settings'] ?? {}) as Record<string, unknown>;

  return {
    ...profile.toJSON(),
    id: profile._id.toString(),
    userId: profile.userId.toString(),
    fullName: user?.fullName ?? '',
    email: user?.email ?? '',
    tier: subscription?.tier ?? 'standard',
    credits: subscription?.priorityCredits ?? 0,
    status: subscription?.status ?? 'active',
    completeness: profile.completeness?.overall ?? profile.profileCompleteness ?? 0,
    profileCompleteness: profile.profileCompleteness ?? profile.completeness?.overall ?? 0,
    bio: profile.idealPartnerDescription ?? '',
    relationshipVision: profile.lifeVision ?? '',
    location: {
      ...(profile.location ?? {}),
      label: locationLabel,
    },
    nonNegotiables: profile.nonNegotiables ?? [],
    settings,
  };
}

export const profileController = {
  async getMe(req: Request, res: Response, next: NextFunction) {
    try {
      let profile = await buildProfileResponse(req.user!.userId);
      if (!profile) {
        await Profile.create({ userId: req.user!.userId });
        profile = await buildProfileResponse(req.user!.userId);
      }
      if (!profile) return next(new AppError('Profile not found', 404));
      res.json(profile);
    } catch (err) {
      next(err);
    }
  },

  async updateMe(req: Request, res: Response, next: NextFunction) {
    try {
      const {
        basic,
        background,
        vision,
        preferences,
        fullName,
        occupation,
        location,
        bio,
        relationshipVision,
        nonNegotiables,
        settings,
      } = req.body as {
        basic?: object;
        background?: object;
        vision?: object;
        preferences?: object;
        fullName?: string;
        occupation?: string;
        location?: { label?: string; city?: string; country?: string } | string;
        bio?: string;
        relationshipVision?: string;
        nonNegotiables?: string[] | string;
        settings?: Record<string, unknown>;
      };

      const profile = await Profile.findOne({ userId: req.user!.userId });
      if (!profile) return next(new AppError('Profile not found', 404));

      if (basic) profile.basic = basic as Record<string, unknown>;
      if (background) profile.background = background as Record<string, unknown>;
      if (vision) profile.vision = vision as Record<string, unknown>;
      if (preferences) {
        const incomingPrefs = preferences as Record<string, unknown>;
        const normalizedPrefs: Record<string, unknown> = { ...incomingPrefs };

        if (!normalizedPrefs['ageRange']) {
          const min = Number.parseInt(String(incomingPrefs['ageMin'] ?? ''), 10);
          const max = Number.parseInt(String(incomingPrefs['ageMax'] ?? ''), 10);
          if (Number.isFinite(min) && Number.isFinite(max)) {
            normalizedPrefs['ageRange'] = { min, max };
          }
        }

        if (!Array.isArray(normalizedPrefs['countries']) && typeof incomingPrefs['countries'] === 'string') {
          normalizedPrefs['countries'] = toStringArray(incomingPrefs['countries']);
        }

        profile.preferences = {
          ...(profile.preferences as any),
          ...normalizedPrefs,
        } as Record<string, unknown>;
      }

      if (typeof fullName === 'string' && fullName.trim()) {
        await User.findByIdAndUpdate(req.user!.userId, { fullName: fullName.trim() });
      }

      if (typeof occupation === 'string') {
        profile.occupation = occupation.trim();
        profile.basic = {
          ...(profile.basic ?? {}),
          occupation: occupation.trim(),
        } as any;
      }

      if (location) {
        const locationObject =
          typeof location === 'string' ? undefined : location;
        const label = typeof location === 'string' ? location : locationObject?.label;
        const [city, country] = typeof label === 'string'
          ? label.split(',').map((part) => part.trim())
          : [locationObject?.city, locationObject?.country];

        if (city || country) {
          profile.location = {
            city: city || profile.location?.city || 'Unknown',
            country: country || profile.location?.country || 'Unknown',
            countryCode: (country || profile.location?.countryCode || 'KE').slice(0, 2).toUpperCase(),
            coordinates: profile.location?.coordinates ?? { type: 'Point', coordinates: [0, 0] },
          } as any;
        }
      }

      if (typeof bio === 'string') {
        profile.idealPartnerDescription = bio.trim();
      }

      if (typeof relationshipVision === 'string') {
        profile.lifeVision = relationshipVision.trim();
      }

      if (Array.isArray(nonNegotiables) || typeof nonNegotiables === 'string') {
        profile.nonNegotiables = Array.isArray(nonNegotiables)
          ? nonNegotiables.map((item) => String(item).trim()).filter(Boolean)
          : toStringArray(nonNegotiables, '\n');
      }

      if (settings && typeof settings === 'object') {
        profile.basic = {
          ...(profile.basic ?? {}),
          settings,
        } as any;
      }

      await profile.save();

      const response = await buildProfileResponse(req.user!.userId);
      res.json(response ?? profile);
    } catch (err) {
      next(err);
    }
  },
};
