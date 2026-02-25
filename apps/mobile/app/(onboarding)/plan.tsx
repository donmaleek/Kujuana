import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { SubscriptionTier, TIER_CONFIG } from '@kujuana/shared';
import { ApiError } from '@/lib/api/types';
import { saveOnboardingStep } from '@/lib/api/endpoints';
import { useAuthStore } from '@/store/auth-store';
import { refreshProfile } from '@/lib/auth/bootstrap';
import { OnboardingScaffold } from '@/components/common/OnboardingScaffold';
import { ErrorBanner } from '@/components/common/ErrorBanner';
import { theme } from '@/lib/config/theme';
import { formatCurrency } from '@/lib/utils/format';

export default function PlanStepScreen() {
  const profile = useAuthStore((state) => state.profile);
  const existingTier = useMemo(() => {
    const tier = (profile as any)?.plan?.tier;
    if (tier === SubscriptionTier.Standard || tier === SubscriptionTier.Priority || tier === SubscriptionTier.VIP) {
      return tier;
    }
    return SubscriptionTier.Standard;
  }, [profile]);

  const [tier, setTier] = useState<SubscriptionTier>(existingTier);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  async function continueToNext() {
    setError('');
    setSaving(true);

    try {
      await saveOnboardingStep(1, { tier });
      await refreshProfile();
      router.push('/(onboarding)/basic');
    } catch (err) {
      if (err instanceof ApiError || err instanceof Error) {
        setError(err.message);
      } else {
        setError('Unable to save plan selection.');
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <OnboardingScaffold
      step={1}
      title="Choose your path"
      subtitle="Pick the matchmaking cadence that fits your expectations."
      onContinue={continueToNext}
      continueLoading={saving}
    >
      {error ? <ErrorBanner message={error} /> : null}

      <View style={styles.grid}>
        {[SubscriptionTier.Standard, SubscriptionTier.Priority, SubscriptionTier.VIP].map((plan) => {
          const config = TIER_CONFIG[plan];
          const isSelected = tier === plan;

          return (
            <Pressable
              key={plan}
              style={[styles.card, isSelected && styles.cardActive]}
              onPress={() => setTier(plan)}
            >
              <Text style={styles.planName}>{config.label}</Text>
              <Text style={styles.price}>{formatCurrency(config.price.KES, 'KES')}</Text>
              <Text style={styles.meta}>or {formatCurrency(config.price.USD, 'USD')}</Text>
              <Text style={styles.meta}>Cadence: {config.matchingCadence}</Text>
              <Text style={styles.meta}>Credits: {config.creditsPerCycle}</Text>
              <Text style={styles.meta}>Private photos: {config.privatePhotoAccess ? 'Yes' : 'No'}</Text>
              <Text style={styles.meta}>Matchmaker: {config.matchmakerAccess ? 'Yes' : 'No'}</Text>
            </Pressable>
          );
        })}
      </View>
    </OnboardingScaffold>
  );
}

const styles = StyleSheet.create({
  grid: {
    gap: 12,
  },
  card: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.md,
    gap: 6,
  },
  cardActive: {
    borderColor: '#F0D38E',
    backgroundColor: 'rgba(227,193,111,0.14)',
  },
  planName: {
    fontFamily: theme.font.sansBold,
    fontSize: 20,
    color: theme.colors.text,
  },
  price: {
    fontFamily: theme.font.serif,
    fontSize: 28,
    color: theme.colors.primary,
  },
  meta: {
    fontFamily: theme.font.sans,
    color: theme.colors.textMuted,
  },
});
