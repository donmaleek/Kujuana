import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { StyleSheet, Text, View } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import { Ionicons } from '@expo/vector-icons';
import { SubscriptionTier, TIER_CONFIG, type SubscriptionTier as TierType } from '@kujuana/shared';
import { initiatePayment } from '@/lib/api/endpoints';
import { ApiError } from '@/lib/api/types';
import { Screen } from '@/components/ui/Screen';
import { SectionCard } from '@/components/ui/SectionCard';
import { ChoiceChips } from '@/components/ui/ChoiceChips';
import { Button } from '@/components/ui/Button';
import { ErrorBanner } from '@/components/common/ErrorBanner';
import { formatCurrency } from '@/lib/utils/format';
import { theme } from '@/lib/config/theme';

const availableTiers = [SubscriptionTier.Standard, SubscriptionTier.Priority, SubscriptionTier.VIP];
const tierIcons = {
  standard: 'star-outline',
  priority: 'flash-outline',
  vip: 'diamond-outline',
};
const tierColors = {
  standard: ['#6EDBB0', '#059669'],
  priority: ['#C084FC', '#7C3AED'],
  vip: ['#FFE680', '#D9A300'],
};
const featureList = [
  { key: 'matchingCadence', label: 'Matching cadence' },
  { key: 'creditsPerCycle', label: 'Credits per cycle' },
  { key: 'privatePhotoAccess', label: 'Private photos' },
  { key: 'matchmakerAccess', label: 'Matchmaker access' },
];

function featureValue(tier: TierType, key: string): string {
  const value = (TIER_CONFIG[tier] as Record<string, unknown>)[key];
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  return String(value ?? '—');
}

export default function UpgradeTabScreen() {
  const [tier, setTier] = useState<TierType>(SubscriptionTier.Priority);
  const [gateway, setGateway] = useState<'paystack' | 'pesapal' | 'flutterwave'>('paystack');
  const [currency, setCurrency] = useState<'KES' | 'USD'>('KES');
  const [error, setError] = useState('');
  const [checkoutState, setCheckoutState] = useState('');

  const paymentMutation = useMutation({
    mutationFn: initiatePayment,
    onSuccess: async (payload) => {
      const url = payload.checkoutUrl ?? payload.redirectUrl ?? undefined;
      if (url) {
        setCheckoutState('Checkout link opened in browser.');
        await WebBrowser.openBrowserAsync(url);
        return;
      }

      setCheckoutState(payload.message ?? 'Payment request started.');
    },
    onError: (err) => {
      if (err instanceof ApiError || err instanceof Error) {
        setError(err.message);
      } else {
        setError('Unable to start checkout.');
      }
    },
  });

  return (
    <Screen>
      <Text style={styles.screenTitle}>Upgrade</Text>
      {error ? <ErrorBanner message={error} /> : null}

      {/* Tier cards */}
      <View style={styles.tierCardsRow}>
        {availableTiers.map((t) => (
          <View
            key={t}
            style={[
              styles.tierCard,
              tier === t && styles.tierCardActive,
              { borderColor: tierColors[t][0], shadowColor: tierColors[t][1] },
            ]}
          >
            <Ionicons
              name={tierIcons[t] as any}
              size={28}
              color={tierColors[t][0]}
              style={{ alignSelf: 'center', marginBottom: 4 }}
            />
            <Text style={styles.tierLabel}>{TIER_CONFIG[t].label}</Text>
            <Text style={styles.tierPrice}>{formatCurrency(TIER_CONFIG[t].price[currency], currency)}</Text>
            <Button
              label={tier === t ? 'Selected' : 'Choose'}
              variant={tier === t ? 'primary' : 'secondary'}
              onPress={() => setTier(t)}
              disabled={tier === t}
            />
          </View>
        ))}
      </View>

      {/* Feature comparison */}
      <SectionCard title="Compare Tiers" subtitle="See what each plan offers.">
        <View style={styles.featureTable}>
          <View style={styles.featureHeaderRow}>
            <Text style={styles.featureHeader}>Feature</Text>
            {availableTiers.map((t) => (
              <Text key={t} style={[styles.featureHeader, { color: tierColors[t][0] }]}>{TIER_CONFIG[t].label}</Text>
            ))}
          </View>
          {featureList.map((feat) => (
            <View key={feat.key} style={styles.featureRow}>
              <Text style={styles.featureLabel}>{feat.label}</Text>
              {availableTiers.map((t) => (
              <Text key={t} style={styles.featureValue}>
                  {featureValue(t, feat.key)}
                </Text>
              ))}
            </View>
          ))}
        </View>
      </SectionCard>

      {/* Gateway and currency selection */}
      <SectionCard title="Payment Options">
        <Text style={styles.label}>Gateway</Text>
        <ChoiceChips
          options={['paystack', 'pesapal', 'flutterwave']}
          selected={[gateway]}
          onChange={(values) => {
            const value = values[0] as 'paystack' | 'pesapal' | 'flutterwave' | undefined;
            if (value) setGateway(value);
          }}
          multiple={false}
        />
        <Text style={styles.label}>Currency</Text>
        <ChoiceChips
          options={['KES', 'USD']}
          selected={[currency]}
          onChange={(values) => {
            const value = values[0] as 'KES' | 'USD' | undefined;
            if (value) setCurrency(value);
          }}
          multiple={false}
        />
        <Button
          label="Continue to Checkout"
          onPress={() => {
            setError('');
            setCheckoutState('');
            paymentMutation.mutate({ tier, gateway, currency });
          }}
          loading={paymentMutation.isPending}
        />
        {checkoutState ? <Text style={styles.small}>{checkoutState}</Text> : null}
      </SectionCard>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screenTitle: {
    fontSize: 28,
    fontFamily: theme.font.sansBold,
    color: theme.colors.primary,
    marginBottom: 18,
    marginTop: 2,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  tierCardsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 18,
    justifyContent: 'center',
  },
  tierCard: {
    flex: 1,
    minWidth: 110,
    maxWidth: 140,
    borderRadius: 18,
    borderWidth: 2,
    backgroundColor: 'rgba(255,255,255,0.10)',
    alignItems: 'center',
    padding: 14,
    marginHorizontal: 2,
    shadowOpacity: 0.18,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 7,
    gap: 8,
  },
  tierCardActive: {
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderWidth: 2.5,
    elevation: 10,
  },
  tierLabel: {
    fontFamily: theme.font.sansBold,
    fontSize: 16,
    color: theme.colors.primary,
    marginBottom: 2,
  },
  tierPrice: {
    fontFamily: theme.font.serif,
    fontSize: 22,
    color: theme.colors.text,
    marginBottom: 2,
  },
  featureTable: {
    marginTop: 8,
    marginBottom: 2,
  },
  featureHeaderRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 4,
  },
  featureHeader: {
    flex: 1,
    fontFamily: theme.font.sansBold,
    fontSize: 13,
    color: theme.colors.text,
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 0.7,
  },
  featureRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 2,
    alignItems: 'center',
  },
  featureLabel: {
    flex: 1,
    fontFamily: theme.font.sans,
    color: theme.colors.text,
    fontSize: 13,
    textAlign: 'left',
  },
  featureValue: {
    flex: 1,
    fontFamily: theme.font.sans,
    color: theme.colors.text,
    fontSize: 13,
    textAlign: 'center',
  },
  label: {
    fontFamily: theme.font.sansBold,
    fontSize: 13,
    color: theme.colors.text,
    textTransform: 'uppercase',
    letterSpacing: 0.7,
    marginTop: 8,
  },
  small: {
    fontFamily: theme.font.sans,
    color: theme.colors.textMuted,
    fontSize: 12,
    marginTop: 6,
  },
});
