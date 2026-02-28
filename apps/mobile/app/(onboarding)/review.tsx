import { useCallback, useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { SubscriptionTier } from '@kujuana/shared';
import { ApiError } from '@/lib/api/types';
import { getPaymentStatus, getSubscription, initiatePayment, submitOnboarding } from '@/lib/api/endpoints';
import { refreshProfile } from '@/lib/auth/bootstrap';
import { useAuthStore } from '@/store/auth-store';
import { OnboardingScaffold } from '@/components/common/OnboardingScaffold';
import { SectionCard } from '@/components/ui/SectionCard';
import { ErrorBanner } from '@/components/common/ErrorBanner';
import { Button } from '@/components/ui/Button';
import { theme } from '@/lib/config/theme';

type PlanTier = 'standard' | 'priority' | 'vip';
type PaymentState = 'idle' | 'pending' | 'completed' | 'failed' | 'cancelled';

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

function tierSatisfiesRequirement(currentTier: PlanTier, requiredTier: PlanTier): boolean {
  return TIER_RANK[currentTier] >= TIER_RANK[requiredTier];
}

export default function ReviewStepScreen() {
  const profile = useAuthStore((state) => state.profile);
  const selectedPlan = useMemo<PlanTier>(() => normalizePlanTier((profile?.basic as Record<string, unknown> | undefined)?.plan), [profile?.basic]);
  const paymentRequired = selectedPlan !== 'standard';

  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [paymentBusy, setPaymentBusy] = useState(false);
  const [paymentError, setPaymentError] = useState('');
  const [checkingPayment, setCheckingPayment] = useState(true);
  const [hasPaidAccess, setHasPaidAccess] = useState(false);
  const [paymentReference, setPaymentReference] = useState<string | null>(null);
  const [paymentState, setPaymentState] = useState<PaymentState>('idle');

  const refreshPaymentEligibility = useCallback(async (): Promise<boolean> => {
    if (!paymentRequired) {
      setHasPaidAccess(true);
      setPaymentState('completed');
      setPaymentError('');
      setCheckingPayment(false);
      return true;
    }

    setCheckingPayment(true);
    try {
      const subscription = await getSubscription();
      const paidTier = normalizePlanTier(subscription.tier);
      const isPaid = Boolean(subscription.isPaid) && tierSatisfiesRequirement(paidTier, selectedPlan);
      setHasPaidAccess(isPaid);
      if (isPaid) {
        setPaymentState('completed');
        setPaymentError('');
      }
      return isPaid;
    } catch {
      setHasPaidAccess(false);
      return false;
    } finally {
      setCheckingPayment(false);
    }
  }, [paymentRequired, selectedPlan]);

  useEffect(() => {
    void refreshPaymentEligibility();
  }, [refreshPaymentEligibility]);

  useEffect(() => {
    if (!paymentRequired || !paymentReference || hasPaidAccess) return;
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | null = null;

    const pollStatus = async () => {
      try {
        const result = await getPaymentStatus(paymentReference);
        if (cancelled) return;
        const status = String(result.status ?? 'pending');
        if (status === 'completed') {
          setPaymentState('completed');
          await refreshPaymentEligibility();
          return;
        }
        if (status === 'failed' || status === 'cancelled') {
          setPaymentState(status);
          return;
        }
        setPaymentState('pending');
      } catch {
        // Ignore transient polling errors.
      }

      if (cancelled) return;
      timer = setTimeout(() => {
        void pollStatus();
      }, 3000);
    };

    void pollStatus();

    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, [hasPaidAccess, paymentReference, paymentRequired, refreshPaymentEligibility]);

  async function startPayment(gateway: 'paystack' | 'pesapal' | 'flutterwave') {
    setPaymentBusy(true);
    setPaymentError('');
    try {
      const payload = await initiatePayment({
        tier:
          selectedPlan === 'vip'
            ? SubscriptionTier.VIP
            : selectedPlan === 'priority'
              ? SubscriptionTier.Priority
              : SubscriptionTier.Standard,
        gateway,
        currency: gateway === 'flutterwave' ? 'USD' : 'KES',
        purpose: 'subscription_new',
      });

      const reference = payload.reference ?? payload.paymentReference ?? null;
      if (reference) setPaymentReference(reference);

      const checkoutUrl = payload.checkoutUrl ?? payload.redirectUrl ?? undefined;
      if (checkoutUrl) {
        setPaymentState('pending');
        await WebBrowser.openBrowserAsync(checkoutUrl);
      } else if (payload.message) {
        setPaymentState('pending');
      }
    } catch (err) {
      if (err instanceof ApiError || err instanceof Error) {
        setPaymentError(err.message);
      } else {
        setPaymentError('Unable to start payment.');
      }
    } finally {
      setPaymentBusy(false);
    }
  }

  async function submitProfile() {
    setError('');
    setSubmitting(true);

    try {
      if (paymentRequired && !hasPaidAccess) {
        setError('Complete payment before submitting your profile.');
        return;
      }
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
  const completenessOverall = completeness?.overall ?? profile?.profileCompleteness ?? 0;

  return (
    <OnboardingScaffold
      step={7}
      title="Review and submit"
      subtitle={
        paymentRequired
          ? 'Confirm profile quality and complete payment before submission.'
          : 'Confirm your profile quality before entering the matchmaking pool.'
      }
      onContinue={submitProfile}
      continueLabel={
        paymentRequired && checkingPayment
          ? 'Checking payment...'
          : paymentRequired && !hasPaidAccess
            ? 'Pay to submit'
            : 'Submit Profile'
      }
      continueLoading={submitting}
      continueDisabled={
        completenessOverall < 100 ||
        (paymentRequired && (checkingPayment || !hasPaidAccess))
      }
      onBack={() => router.back()}
    >
      {error ? <ErrorBanner message={error} /> : null}

      <SectionCard title="Completeness" subtitle="Profiles must hit 100% before activation.">
        <Text style={styles.progress}>{completenessOverall}% complete</Text>
        <View style={styles.flags}>
          <StatusTag label="Basic" complete={Boolean(completeness?.basic)} />
          <StatusTag label="Background" complete={Boolean(completeness?.background)} />
          <StatusTag label="Photos" complete={Boolean(completeness?.photos)} />
          <StatusTag label="Vision" complete={Boolean(completeness?.vision)} />
          <StatusTag label="Preferences" complete={Boolean(completeness?.preferences)} />
        </View>
      </SectionCard>

      {paymentRequired ? (
        <SectionCard title="Payment Required" subtitle={`Selected plan: ${selectedPlan.toUpperCase()}. Complete payment to continue.`}>
          {checkingPayment ? <Text style={styles.note}>Checking payment status...</Text> : null}
          {hasPaidAccess ? <Text style={styles.success}>Payment confirmed. You can submit now.</Text> : null}
          {!hasPaidAccess && !checkingPayment ? (
            <View style={styles.paymentActions}>
              <Button
                label={paymentBusy ? 'Starting...' : 'Pay with Paystack'}
                onPress={() => startPayment('paystack')}
                loading={paymentBusy}
                disabled={paymentBusy}
              />
              <Button
                label="Pay by Card"
                variant="secondary"
                onPress={() => startPayment('pesapal')}
                disabled={paymentBusy}
              />
              <Button
                label="Pay Global"
                variant="ghost"
                onPress={() => startPayment('flutterwave')}
                disabled={paymentBusy}
              />
            </View>
          ) : null}
          {paymentReference ? (
            <Text style={styles.note}>
              Payment reference: {paymentReference} ({paymentState})
            </Text>
          ) : null}
          {paymentError ? <ErrorBanner message={paymentError} /> : null}
        </SectionCard>
      ) : null}

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
  paymentActions: {
    gap: 8,
  },
  success: {
    fontFamily: theme.font.sansBold,
    color: theme.colors.success,
    fontSize: 14,
  },
});
