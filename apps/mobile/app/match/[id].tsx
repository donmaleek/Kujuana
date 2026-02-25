import { useMemo, useState } from 'react';
import { useLocalSearchParams, router } from 'expo-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { StyleSheet, Text, View } from 'react-native';
import { getMatch, respondToMatch } from '@/lib/api/endpoints';
import { ApiError } from '@/lib/api/types';
import { Screen } from '@/components/ui/Screen';
import { SectionCard } from '@/components/ui/SectionCard';
import { Button } from '@/components/ui/Button';
import { LoadingState } from '@/components/common/LoadingState';
import { ErrorBanner } from '@/components/common/ErrorBanner';
import { humanize } from '@/lib/utils/format';
import { theme } from '@/lib/config/theme';

export default function MatchDetailScreen() {
  const params = useLocalSearchParams<{ id?: string }>();
  const matchId = useMemo(() => {
    if (Array.isArray(params.id)) return params.id[0] ?? '';
    return params.id ?? '';
  }, [params.id]);

  const queryClient = useQueryClient();
  const [flashMessage, setFlashMessage] = useState('');

  const matchQuery = useQuery({
    queryKey: ['match', matchId],
    queryFn: () => getMatch(matchId),
    enabled: Boolean(matchId),
  });

  const respondMutation = useMutation({
    mutationFn: (action: 'accepted' | 'declined') => respondToMatch(matchId, action),
    onSuccess: () => {
      setFlashMessage('Response saved.');
      queryClient.invalidateQueries({ queryKey: ['matches'] });
      queryClient.invalidateQueries({ queryKey: ['match', matchId] });
    },
    onError: (error) => {
      if (error instanceof ApiError || error instanceof Error) {
        setFlashMessage(error.message);
      } else {
        setFlashMessage('Could not submit response.');
      }
    },
  });

  return (
    <Screen>
      <Button label="Back to Matches" variant="ghost" onPress={() => router.back()} />

      {matchQuery.isLoading ? (
        <LoadingState label="Loading match details..." />
      ) : matchQuery.isError || !matchQuery.data ? (
        <ErrorBanner message="Match details are unavailable." />
      ) : (
        <>
          <SectionCard title={`${matchQuery.data.score}% compatibility`} subtitle="Algorithmic breakdown by compatibility axis.">
            <Text style={styles.row}>Tier: {humanize(matchQuery.data.tier)}</Text>
            <Text style={styles.row}>Status: {humanize(matchQuery.data.status)}</Text>
            <Text style={styles.row}>Your action: {humanize(matchQuery.data.userAction)}</Text>
            <Text style={styles.row}>Other user action: {humanize(matchQuery.data.matchedUserAction)}</Text>
          </SectionCard>

          <SectionCard title="Score breakdown">
            {Object.entries(matchQuery.data.scoreBreakdown).map(([key, value]) => (
              <View key={key} style={styles.breakdownRow}>
                <Text style={styles.breakdownLabel}>{humanize(key)}</Text>
                <Text style={styles.breakdownValue}>{value}%</Text>
              </View>
            ))}
          </SectionCard>

          {flashMessage ? <ErrorBanner message={flashMessage} /> : null}

          <View style={styles.actions}>
            <Button
              label="Accept Match"
              onPress={() => respondMutation.mutate('accepted')}
              loading={respondMutation.isPending}
            />
            <Button
              label="Decline Match"
              variant="danger"
              onPress={() => respondMutation.mutate('declined')}
              loading={respondMutation.isPending}
            />
          </View>
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: {
    fontFamily: theme.font.sans,
    color: theme.colors.text,
    fontSize: 14,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    paddingBottom: 8,
    marginBottom: 4,
  },
  breakdownLabel: {
    fontFamily: theme.font.sans,
    color: theme.colors.text,
  },
  breakdownValue: {
    fontFamily: theme.font.sansBold,
    color: theme.colors.primaryDeep,
  },
  actions: {
    gap: 10,
  },
});
