import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { StyleSheet, Text, View } from 'react-native';
import { cancelSubscription, getSubscription, markAllNotificationsAsRead } from '@/lib/api/endpoints';
import { signOut } from '@/lib/auth/bootstrap';
import { ApiError } from '@/lib/api/types';
import { Screen } from '@/components/ui/Screen';
import { SectionCard } from '@/components/ui/SectionCard';
import { Button } from '@/components/ui/Button';
import { LoadingState } from '@/components/common/LoadingState';
import { ErrorBanner } from '@/components/common/ErrorBanner';
import { theme } from '@/lib/config/theme';

export default function SettingsTabScreen() {
  const queryClient = useQueryClient();
  const [message, setMessage] = useState('');

  const subscriptionQuery = useQuery({
    queryKey: ['subscription'],
    queryFn: getSubscription,
  });

  const cancelMutation = useMutation({
    mutationFn: cancelSubscription,
    onSuccess: (result) => {
      setMessage(result.message);
      queryClient.invalidateQueries({ queryKey: ['subscription'] });
    },
    onError: (error) => {
      if (error instanceof ApiError || error instanceof Error) {
        setMessage(error.message);
      } else {
        setMessage('Unable to cancel subscription.');
      }
    },
  });

  const readAllMutation = useMutation({
    mutationFn: markAllNotificationsAsRead,
    onSuccess: (result) => {
      setMessage(`Marked ${result.modifiedCount} notifications as read.`);
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  return (
    <Screen>
      {message ? <ErrorBanner message={message} /> : null}

      <SectionCard title="Subscription" subtitle="Manage your current tier and billing state.">
        {subscriptionQuery.isLoading ? (
          <LoadingState label="Loading subscription..." />
        ) : subscriptionQuery.isError ? (
          <ErrorBanner message="Unable to load subscription details." />
        ) : (
          <View style={styles.stack}>
            <Text style={styles.row}>Tier: {subscriptionQuery.data?.tier ?? 'none'}</Text>
            <Text style={styles.row}>Status: {subscriptionQuery.data?.status ?? 'none'}</Text>
            <Button
              label="Cancel At Period End"
              variant="ghost"
              onPress={() => cancelMutation.mutate()}
              loading={cancelMutation.isPending}
            />
          </View>
        )}
      </SectionCard>

      <SectionCard title="Notifications" subtitle="Maintenance actions">
        <Button
          label="Mark All Notifications Read"
          onPress={() => readAllMutation.mutate()}
          variant="secondary"
          loading={readAllMutation.isPending}
        />
      </SectionCard>

      <SectionCard title="Session">
        <Button label="Sign Out" variant="danger" onPress={() => signOut()} />
      </SectionCard>
    </Screen>
  );
}

const styles = StyleSheet.create({
  stack: {
    gap: 8,
  },
  row: {
    fontFamily: theme.font.sans,
    color: theme.colors.text,
  },
});
