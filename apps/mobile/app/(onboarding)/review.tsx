import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { ApiError } from '@/lib/api/types';
import { submitOnboarding } from '@/lib/api/endpoints';
import { refreshProfile } from '@/lib/auth/bootstrap';
import { useAuthStore } from '@/store/auth-store';
import { OnboardingScaffold } from '@/components/common/OnboardingScaffold';
import { SectionCard } from '@/components/ui/SectionCard';
import { ErrorBanner } from '@/components/common/ErrorBanner';
import { theme } from '@/lib/config/theme';

export default function ReviewStepScreen() {
  const profile = useAuthStore((state) => state.profile);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function submitProfile() {
    setError('');
    setSubmitting(true);

    try {
      await submitOnboarding();
      await refreshProfile();
      router.replace('/(tabs)/home');
    } catch (err) {
      if (err instanceof ApiError || err instanceof Error) {
        setError(err.message);
      } else {
        setError('Unable to submit profile.');
      }
    } finally {
      setSubmitting(false);
    }
  }

  const completeness = profile?.completeness;

  return (
    <OnboardingScaffold
      step={7}
      title="Review and submit"
      subtitle="Confirm your profile quality before entering the matchmaking pool."
      onContinue={submitProfile}
      continueLabel="Submit Profile"
      continueLoading={submitting}
      continueDisabled={!completeness || completeness.overall < 100}
      onBack={() => router.back()}
    >
      {error ? <ErrorBanner message={error} /> : null}

      <SectionCard title="Completeness" subtitle="Profiles must hit 100% before activation.">
        <Text style={styles.progress}>{completeness?.overall ?? 0}% complete</Text>
        <View style={styles.flags}>
          <StatusTag label="Basic" complete={Boolean(completeness?.basic)} />
          <StatusTag label="Background" complete={Boolean(completeness?.background)} />
          <StatusTag label="Photos" complete={Boolean(completeness?.photos)} />
          <StatusTag label="Vision" complete={Boolean(completeness?.vision)} />
          <StatusTag label="Preferences" complete={Boolean(completeness?.preferences)} />
        </View>
      </SectionCard>

      <SectionCard title="Submission notes" subtitle="What happens next">
        <Text style={styles.note}>- Your profile is reviewed for quality and policy checks.</Text>
        <Text style={styles.note}>- You’ll receive match notifications as candidates are prepared.</Text>
        <Text style={styles.note}>- Priority and VIP tiers accelerate discovery and introductions.</Text>
      </SectionCard>
    </OnboardingScaffold>
  );
}

function StatusTag({ label, complete }: { label: string; complete: boolean }) {
  return (
    <View style={[styles.tag, complete ? styles.tagComplete : styles.tagPending]}>
      <Text style={[styles.tagText, complete ? styles.tagTextComplete : styles.tagTextPending]}>
        {label}: {complete ? 'Ready' : 'Pending'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  progress: {
    fontFamily: theme.font.serif,
    color: theme.colors.primary,
    fontSize: 30,
  },
  flags: {
    gap: 8,
  },
  tag: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 8,
    alignSelf: 'flex-start',
  },
  tagComplete: {
    borderColor: 'rgba(110,219,176,0.48)',
    backgroundColor: theme.colors.successSurface,
  },
  tagPending: {
    borderColor: theme.colors.border,
    backgroundColor: 'rgba(227,193,111,0.16)',
  },
  tagText: {
    fontFamily: theme.font.sansBold,
    fontSize: 13,
  },
  tagTextComplete: {
    color: theme.colors.success,
  },
  tagTextPending: {
    color: theme.colors.primary,
  },
  note: {
    fontFamily: theme.font.sans,
    color: theme.colors.textMuted,
    fontSize: 14,
  },
});
