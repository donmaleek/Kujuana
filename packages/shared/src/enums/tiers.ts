export enum SubscriptionTier {
  Standard = 'standard',
  Priority = 'priority',
  VIP = 'vip',
}

export const TIER_CONFIG = {
  [SubscriptionTier.Standard]: {
    label: 'Standard',
    price: { KES: 2500, USD: 20 },
    matchingCadence: 'nightly',
    creditsPerCycle: 0,
    privatePhotoAccess: false,
    matchmakerAccess: false,
  },
  [SubscriptionTier.Priority]: {
    label: 'Priority',
    price: { KES: 6000, USD: 45 },
    matchingCadence: 'instant',
    creditsPerCycle: 3,
    privatePhotoAccess: true,
    matchmakerAccess: false,
  },
  [SubscriptionTier.VIP]: {
    label: 'VIP',
    price: { KES: 15000, USD: 110 },
    matchingCadence: 'curated',
    creditsPerCycle: 10,
    privatePhotoAccess: true,
    matchmakerAccess: true,
  },
} as const;

export type TierAddOn = 'extra_credits' | 'profile_boost' | 'international_filter';
