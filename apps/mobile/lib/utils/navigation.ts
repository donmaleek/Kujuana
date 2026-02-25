type OnboardingCompleteness = {
  basic?: boolean;
  background?: boolean;
  vision?: boolean;
  preferences?: boolean;
  photos?: boolean;
  overall?: number;
};

type MinimalProfile = {
  onboardingStep?: number;
  completeness?: OnboardingCompleteness;
};

export function resolveOnboardingRoute(profile: MinimalProfile | null | undefined):
  | '/(onboarding)/basic'
  | '/(onboarding)/background'
  | '/(onboarding)/vision'
  | '/(onboarding)/preferences'
  | '/(onboarding)/photos'
  | '/(onboarding)/review' {
  const completeness = profile?.completeness;

  if (!completeness) {
    if ((profile?.onboardingStep ?? 1) >= 2) return '/(onboarding)/basic';
    return '/(onboarding)/basic';
  }

  if (!completeness.basic) return '/(onboarding)/basic';
  if (!completeness.background) return '/(onboarding)/background';
  if (!completeness.vision) return '/(onboarding)/vision';
  if (!completeness.preferences) return '/(onboarding)/preferences';
  if (!completeness.photos) return '/(onboarding)/photos';

  return '/(onboarding)/review';
}
