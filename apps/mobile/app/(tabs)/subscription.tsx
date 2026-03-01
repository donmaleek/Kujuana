import { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { AppScreen } from '@/components/ui/AppScreen';
import { FadeIn } from '@/components/ui/FadeIn';
import { GlassCard } from '@/components/ui/GlassCard';
import { GoldButton } from '@/components/ui/GoldButton';
import { TabScreenHeader } from '@/components/ui/TabScreenHeader';
import { CheckoutSheet, type CheckoutPlan } from '@/components/ui/CheckoutSheet';
import { plans, priorityCreditBundles } from '@/lib/data/mock';
import { COLORS, FONT, GRADIENTS, RADIUS } from '@/lib/theme/tokens';
import { useAppData } from '@/lib/state/app-data';
import { useSession } from '@/lib/state/session';

function normalizeTier(tier: string | undefined): 'standard' | 'priority' | 'vip' {
  if (tier === 'vip' || tier === 'priority') return tier;
  return 'standard';
}

const BUNDLE_PLANS: CheckoutPlan[] = [
  { purpose: 'priority_single', label: 'Buy 1 Priority Match', price: 'KES 500' },
  { purpose: 'priority_bundle_5', label: 'Buy 5 Credits', price: 'KES 2,000' },
  { purpose: 'priority_bundle_10', label: 'Buy 10 Credits', price: 'KES 3,500' },
];

export default function SubscriptionScreen() {
  const { user } = useSession();
  const { profile, subscription, loading, refreshing, error, refreshAll } = useAppData();
  const [checkout, setCheckout] = useState<CheckoutPlan | null>(null);

  const currentTier = normalizeTier(subscription?.tier || profile?.tier || user?.tier);
  const credits = subscription?.credits ?? subscription?.priorityCredits ?? profile?.credits ?? user?.credits ?? 0;
  const isPaid = Boolean(subscription?.isPaid || currentTier !== 'standard');
  const renewsAt = subscription?.renewsAt || subscription?.nextBillingAt;
  const renewalLabel = renewsAt
    ? new Date(renewsAt).toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' })
    : 'Not scheduled';

  function openCheckout(plan: CheckoutPlan) {
    setCheckout(plan);
  }

  function closeCheckout() {
    setCheckout(null);
  }

  function handleSuccess() {
    setCheckout(null);
    refreshAll();
  }

  return (
    <AppScreen>
      <FadeIn>
        <TabScreenHeader
          title="Membership"
          subtitle="Manage plans, compare tiers, and align your credits with your matching goals."
        />
      </FadeIn>

      <FadeIn delay={110}>
        <GlassCard highlighted>
          <View style={styles.currentRow}>
            <View>
              <Text style={styles.currentEyebrow}>Current plan</Text>
              <Text style={styles.currentName}>{currentTier.toUpperCase()}</Text>
            </View>
            <View style={styles.currentBadge}>
              <MaterialCommunityIcons name="crown" size={14} color={COLORS.goldGlow} />
              <Text style={styles.currentBadgeText}>{isPaid ? 'ACTIVE' : 'FREE'}</Text>
            </View>
          </View>

          <View style={styles.creditTrack}>
            <LinearGradient
              colors={GRADIENTS.goldSoft}
              style={[styles.creditFill, { width: `${Math.min(100, Math.max(8, Number(credits) * 8))}%` }]}
            />
          </View>

          <View style={styles.creditRow}>
            <Text style={styles.creditText}>{`Priority credits: ${credits}`}</Text>
            <Text style={styles.creditText}>{`Renews: ${renewalLabel}`}</Text>
          </View>

          <View style={styles.refreshRow}>
            <GoldButton label={refreshing ? 'Refreshing...' : 'Refresh membership'} onPress={refreshAll} />
          </View>

          {loading ? (
            <View style={styles.loadingWrap}>
              <ActivityIndicator size="small" color={COLORS.goldGlow} />
              <Text style={styles.loadingText}>Loading subscription...</Text>
            </View>
          ) : null}

          {error ? <Text style={styles.errorText}>{error}</Text> : null}
        </GlassCard>
      </FadeIn>

      {plans.map((plan, index) => {
        const isCurrent = plan.id === currentTier;
        return (
          <FadeIn key={plan.id} delay={200 + index * 70}>
            <GlassCard highlighted={isCurrent}>
              <View style={styles.planTop}>
                <View>
                  <Text style={styles.planName}>{plan.name}</Text>
                  <Text style={styles.planTagline}>{plan.tagline}</Text>
                  <Text style={styles.planPrice}>{plan.price}</Text>
                  <Text style={styles.planPriceSub}>{plan.priceSub}</Text>
                </View>
                {isCurrent ? (
                  <View style={styles.planCurrentPill}>
                    <Text style={styles.planCurrentText}>Current</Text>
                  </View>
                ) : null}
              </View>

              <Text style={styles.planDescription}>{plan.description}</Text>

              <View style={styles.perksWrap}>
                {plan.perks.map((perk) => (
                  <View key={perk} style={styles.perkRow}>
                    <MaterialCommunityIcons name="check" size={14} color={COLORS.goldChampagne} />
                    <Text style={styles.perkText}>{perk}</Text>
                  </View>
                ))}
              </View>

              {/* Priority: show individual bundle buy buttons */}
              {plan.id === 'priority' ? (
                <View style={styles.bundleWrap}>
                  <Text style={styles.bundleTitle}>Credit bundles</Text>
                  {priorityCreditBundles.map((bundle, i) => {
                    const bundlePlan = BUNDLE_PLANS[i];
                    return (
                      <View key={bundle.credits} style={styles.bundleRow}>
                        <View style={styles.bundleInfo}>
                          <Text style={styles.bundleValue}>{`${bundle.credits} credit${bundle.credits > 1 ? 's' : ''}`}</Text>
                          <Text style={styles.bundlePrice}>{bundle.price}</Text>
                          <Text style={styles.bundleSaving}>{bundle.savings ?? ' '}</Text>
                        </View>
                        {bundlePlan && (
                          <GoldButton
                            label="Buy"
                            outlined={i > 0}
                            onPress={() => openCheckout(bundlePlan)}
                          />
                        )}
                      </View>
                    );
                  })}
                </View>
              ) : null}

              <GoldButton
                label={
                  isCurrent
                    ? plan.id === 'priority'
                      ? 'Current plan'
                      : 'Current plan'
                    : plan.id === 'standard'
                      ? 'Get Started'
                      : plan.id === 'priority'
                        ? 'Buy 1 Match (KES 500)'
                        : 'Upgrade to VIP'
                }
                outlined={isCurrent}
                onPress={
                  isCurrent
                    ? refreshAll
                    : plan.id === 'vip'
                      ? () => openCheckout({ purpose: 'vip_monthly', label: 'VIP Monthly Membership', price: 'KES 10,000/month' })
                      : plan.id === 'priority'
                        ? () => openCheckout(BUNDLE_PLANS[0])
                        : refreshAll
                }
              />
            </GlassCard>
          </FadeIn>
        );
      })}

      {/* Checkout bottom sheet */}
      {checkout && (
        <CheckoutSheet
          visible
          plan={checkout}
          onClose={closeCheckout}
          onSuccess={handleSuccess}
        />
      )}
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  currentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  currentEyebrow: {
    color: COLORS.textMuted,
    fontFamily: FONT.bodyMedium,
    fontSize: 11,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  currentName: {
    marginTop: 2,
    color: COLORS.offWhite,
    fontFamily: FONT.display,
    fontSize: 28,
  },
  currentBadge: {
    borderRadius: RADIUS.pill,
    borderWidth: 1,
    borderColor: COLORS.stroke,
    backgroundColor: 'rgba(212,175,55,0.14)',
    paddingHorizontal: 9,
    paddingVertical: 5,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  currentBadgeText: {
    color: COLORS.goldGlow,
    fontFamily: FONT.bodySemiBold,
    fontSize: 10,
    letterSpacing: 0.8,
  },
  creditTrack: {
    marginTop: 12,
    height: 8,
    borderRadius: RADIUS.pill,
    backgroundColor: 'rgba(255,255,255,0.08)',
    overflow: 'hidden',
  },
  creditFill: {
    height: '100%',
    borderRadius: RADIUS.pill,
  },
  creditRow: {
    marginTop: 7,
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  creditText: {
    color: COLORS.textMuted,
    fontFamily: FONT.body,
    fontSize: 12,
  },
  refreshRow: {
    marginTop: 12,
  },
  loadingWrap: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  loadingText: {
    color: COLORS.textMuted,
    fontFamily: FONT.body,
    fontSize: 12,
  },
  errorText: {
    marginTop: 6,
    color: COLORS.danger,
    fontFamily: FONT.body,
    fontSize: 12,
  },
  planTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  planName: {
    color: COLORS.offWhite,
    fontFamily: FONT.display,
    fontSize: 28,
    lineHeight: 32,
  },
  planPrice: {
    color: COLORS.goldChampagne,
    fontFamily: FONT.bodySemiBold,
    fontSize: 22,
    marginTop: 8,
    lineHeight: 24,
  },
  planTagline: {
    marginTop: 2,
    color: COLORS.textMuted,
    fontFamily: FONT.body,
    fontSize: 12,
  },
  planPriceSub: {
    color: COLORS.textMuted,
    fontFamily: FONT.body,
    fontSize: 12,
    marginTop: 2,
  },
  planCurrentPill: {
    borderRadius: RADIUS.pill,
    backgroundColor: 'rgba(212,175,55,0.18)',
    borderWidth: 1,
    borderColor: COLORS.stroke,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  planCurrentText: {
    color: COLORS.goldGlow,
    fontFamily: FONT.bodyMedium,
    fontSize: 11,
  },
  planDescription: {
    marginTop: 4,
    color: COLORS.textBody,
    fontFamily: FONT.body,
    fontSize: 14,
    lineHeight: 20,
  },
  perksWrap: {
    marginTop: 10,
    marginBottom: 13,
    gap: 6,
  },
  perkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  perkText: {
    color: COLORS.textBody,
    fontFamily: FONT.body,
    fontSize: 13,
  },
  bundleWrap: {
    marginBottom: 12,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.strokeSoft,
    backgroundColor: 'rgba(255,255,255,0.03)',
    padding: 10,
    gap: 6,
  },
  bundleTitle: {
    color: COLORS.goldChampagne,
    fontFamily: FONT.bodySemiBold,
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  bundleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  bundleInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  bundleValue: {
    color: COLORS.offWhite,
    fontFamily: FONT.bodyMedium,
    fontSize: 12,
  },
  bundlePrice: {
    color: COLORS.goldGlow,
    fontFamily: FONT.bodySemiBold,
    fontSize: 12,
  },
  bundleSaving: {
    color: COLORS.textMuted,
    fontFamily: FONT.body,
    fontSize: 11,
  },
});
