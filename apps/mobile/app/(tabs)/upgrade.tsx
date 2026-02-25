import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { StyleSheet, Text, View } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
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

export default function UpgradeTabScreen() {
  const [tier, setTier] = useState<TierType>(SubscriptionTier.Priority);
  const [gateway, setGateway] = useState<'pesapal' | 'flutterwave'>('pesapal');
  const [currency, setCurrency] = useState<'KES' | 'USD'>('KES');
  const [error, setError] = useState('');
  const [checkoutUrl, setCheckoutUrl] = useState('');

  const paymentMutation = useMutation({
    mutationFn: initiatePayment,
    onSuccess: async (payload) => {
      setCheckoutUrl(payload.checkoutUrl);
      await WebBrowser.openBrowserAsync(payload.checkoutUrl);
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
      <SectionCard title="Upgrade your plan" subtitle="Payments are gateway-hosted for secure completion.">
        {error ? <ErrorBanner message={error} /> : null}

        <Text style={styles.label}>Choose Tier</Text>
        <ChoiceChips
          options={availableTiers}
          selected={[tier]}
          onChange={(values) => {
            const value = values[0] as TierType | undefined;
            if (value) setTier(value);
          }}
          multiple={false}
        />

        <View style={styles.priceCard}>
          <Text style={styles.priceLabel}>{TIER_CONFIG[tier].label}</Text>
          <Text style={styles.priceValue}>{formatCurrency(TIER_CONFIG[tier].price[currency], currency)}</Text>
          <Text style={styles.priceMeta}>Cadence: {TIER_CONFIG[tier].matchingCadence}</Text>
          <Text style={styles.priceMeta}>Credits per cycle: {TIER_CONFIG[tier].creditsPerCycle}</Text>
        </View>

        <Text style={styles.label}>Gateway</Text>
        <ChoiceChips
          options={['pesapal', 'flutterwave']}
          selected={[gateway]}
          onChange={(values) => {
            const value = values[0] as 'pesapal' | 'flutterwave' | undefined;
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
            paymentMutation.mutate({ tier, gateway, currency });
          }}
          loading={paymentMutation.isPending}
        />

        {checkoutUrl ? <Text style={styles.small}>Checkout link opened in browser.</Text> : null}
      </SectionCard>
    </Screen>
  );
}

const styles = StyleSheet.create({
  label: {
    fontFamily: theme.font.sansBold,
    fontSize: 13,
    color: theme.colors.text,
    textTransform: 'uppercase',
    letterSpacing: 0.7,
  },
  priceCard: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 14,
    padding: 12,
    backgroundColor: 'rgba(227,193,111,0.16)',
    gap: 3,
  },
  priceLabel: {
    fontFamily: theme.font.sansBold,
    color: theme.colors.primary,
  },
  priceValue: {
    fontFamily: theme.font.serif,
    fontSize: 30,
    color: theme.colors.text,
  },
  priceMeta: {
    fontFamily: theme.font.sans,
    color: theme.colors.textMuted,
    fontSize: 13,
  },
  small: {
    fontFamily: theme.font.sans,
    color: theme.colors.textMuted,
    fontSize: 12,
  },
});
