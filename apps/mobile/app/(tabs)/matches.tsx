import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { listMatches, requestPriorityMatch } from '@/lib/api/endpoints';
import { ApiError } from '@/lib/api/types';
import { Screen } from '@/components/ui/Screen';
import { SectionCard } from '@/components/ui/SectionCard';
import { Button } from '@/components/ui/Button';
import { LoadingState } from '@/components/common/LoadingState';
import { ErrorBanner } from '@/components/common/ErrorBanner';
import { humanize } from '@/lib/utils/format';
import { theme } from '@/lib/config/theme';

export default function MatchesTabScreen() {
  const queryClient = useQueryClient();
  const [flashMessage, setFlashMessage] = useState('');

  const matchesQuery = useQuery({
    queryKey: ['matches'],
    queryFn: listMatches,
  });

  const priorityMutation = useMutation({
    mutationFn: requestPriorityMatch,
    onSuccess: (result) => {
      setFlashMessage(result.message);
      queryClient.invalidateQueries({ queryKey: ['matches'] });
    },
    onError: (error) => {
      if (error instanceof ApiError || error instanceof Error) {
        setFlashMessage(error.message);
      } else {
        setFlashMessage('Unable to queue priority request.');
      }
    },
  });

  return (
    <Screen>
      <SectionCard title="Your matches" subtitle="Respond quickly to keep compatibility flow active.">
        <Button
          label="Request Priority Match"
          variant="secondary"
          onPress={() => priorityMutation.mutate()}
          loading={priorityMutation.isPending}
        />
        {flashMessage ? <Text style={styles.flash}>{flashMessage}</Text> : null}

        {matchesQuery.isLoading ? (
          <LoadingState label="Loading matches..." />
        ) : matchesQuery.isError ? (
          <ErrorBanner message="Unable to load matches. Pull to refresh or retry later." />
        ) : matchesQuery.data?.length ? (
          matchesQuery.data.map((match) => (
            <Pressable
              key={match._id}
              style={styles.matchCard}
              onPress={() => router.push({ pathname: '/match/[id]', params: { id: match._id } })}
            >
              <Text style={styles.matchTier}>{humanize(match.tier)}</Text>
              <Text style={styles.matchScore}>{match.score}% compatibility</Text>
              <Text style={styles.matchMeta}>Status: {humanize(match.status)}</Text>
              <Text style={styles.matchMeta}>Introduced: {new Date(match.createdAt).toLocaleDateString()}</Text>
            </Pressable>
          ))
        ) : (
          <Text style={styles.empty}>No matches yet. Your queue is active.</Text>
        )}
      </SectionCard>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flash: {
    fontFamily: theme.font.sans,
    color: theme.colors.primaryDeep,
    fontSize: 13,
  },
  matchCard: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 14,
    backgroundColor: theme.colors.card,
    padding: 12,
    gap: 4,
  },
  matchTier: {
    fontFamily: theme.font.sansBold,
    color: theme.colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontSize: 11,
  },
  matchScore: {
    fontFamily: theme.font.serif,
    color: theme.colors.text,
    fontSize: 26,
  },
  matchMeta: {
    fontFamily: theme.font.sans,
    color: theme.colors.textMuted,
    fontSize: 13,
  },
  empty: {
    fontFamily: theme.font.sans,
    color: theme.colors.textMuted,
    fontSize: 14,
  },
});
