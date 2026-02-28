import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Pressable, StyleSheet, Text } from 'react-native';
import { Screen } from '@/components/ui/Screen';
import { SectionCard } from '@/components/ui/SectionCard';
import { LoadingState } from '@/components/common/LoadingState';
import { ErrorBanner } from '@/components/common/ErrorBanner';
import { AdminNav } from '@/components/admin/AdminNav';
import { listAdminQueue, markAdminQueueInReview } from '@/lib/api/endpoints';
import { theme } from '@/lib/config/theme';

export default function AdminQueueScreen() {
  const queryClient = useQueryClient();
  const queueQuery = useQuery({
    queryKey: ['admin', 'queue'],
    queryFn: listAdminQueue,
  });

  const reviewMutation = useMutation({
    mutationFn: markAdminQueueInReview,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'queue'] });
    },
  });

  return (
    <Screen>
      <Text style={styles.title}>Queue</Text>
      <AdminNav active="queue" />

      {queueQuery.isLoading ? <LoadingState label="Loading queue..." /> : null}
      {queueQuery.isError ? <ErrorBanner message="Unable to load queue." /> : null}

      {(queueQuery.data ?? []).map((item) => (
        <SectionCard
          key={item.id}
          title={`${item.tier.toUpperCase()} • ${item.status}`}
          subtitle={`${item.requesterName} → ${item.candidateName}`}
        >
          <Text style={styles.meta}>Score: {Math.round(item.score)}%</Text>
          <Text style={styles.meta}>Wait: {item.waitHours.toFixed(1)} hours</Text>
          {item.requestId ? (
            <Pressable
              style={styles.reviewBtn}
              onPress={() => reviewMutation.mutate(item.requestId!)}
              disabled={reviewMutation.isPending}
            >
              <Text style={styles.reviewText}>
                {reviewMutation.isPending ? 'Updating...' : 'Mark In Review'}
              </Text>
            </Pressable>
          ) : null}
        </SectionCard>
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: {
    fontFamily: theme.font.serif,
    color: theme.colors.primary,
    fontSize: 34,
    marginBottom: 12,
  },
  meta: {
    fontFamily: theme.font.sans,
    color: theme.colors.text,
    fontSize: 13,
  },
  reviewBtn: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(212,175,55,0.5)',
    backgroundColor: 'rgba(212,175,55,0.14)',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  reviewText: {
    fontFamily: theme.font.sansBold,
    color: theme.colors.primary,
    fontSize: 12,
  },
});
