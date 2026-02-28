import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { StyleSheet, Text, View, Image } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '@/store/auth-store';
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
  const profile = useAuthStore((state) => state.profile);
  const role = useAuthStore((state) => state.role);
  const canAccessAdmin = role === 'admin' || role === 'manager' || role === 'matchmaker';
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
      <Text style={styles.screenTitle}>Settings</Text>
      {/* Profile summary */}
      <View style={styles.profileSummary}>
        <View style={styles.avatarWrap}>
          {profile?.photos?.[0]?.url ? (
            <Image source={{ uri: profile.photos[0].url }} style={styles.avatarImg} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Ionicons name="person" size={32} color={theme.colors.primary} />
            </View>
          )}
        </View>
        <View style={styles.profileInfo}>
          <Text style={styles.profileName}>{profile?.fullName || 'Your Name'}</Text>
          <Text style={styles.profileEmail}>{profile?.email || 'Email not set'}</Text>
        </View>
      </View>

      {message ? <ErrorBanner message={message} /> : null}

      {/* Subscription Section */}
      <View style={styles.sectionHeaderRow}>
        <Ionicons name="card-outline" size={20} color={theme.colors.primary} style={styles.sectionIcon} />
        <Text style={styles.sectionHeader}>Subscription</Text>
      </View>
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

      {/* Notifications Section */}
      <View style={styles.sectionHeaderRow}>
        <Ionicons name="notifications-outline" size={20} color={theme.colors.primary} style={styles.sectionIcon} />
        <Text style={styles.sectionHeader}>Notifications</Text>
      </View>
      <SectionCard title="Notifications" subtitle="Maintenance actions">
        <Button
          label="Mark All Notifications Read"
          onPress={() => readAllMutation.mutate()}
          variant="secondary"
          loading={readAllMutation.isPending}
        />
      </SectionCard>

      {/* Session Section */}
      <View style={styles.sectionHeaderRow}>
        <Ionicons name="log-out-outline" size={20} color={theme.colors.primary} style={styles.sectionIcon} />
        <Text style={styles.sectionHeader}>Session</Text>
      </View>
      <SectionCard title="Session">
        {canAccessAdmin ? (
          <Button
            label="Open Admin Console"
            variant="secondary"
            onPress={() => router.push('/admin/dashboard')}
          />
        ) : null}
        <Button label="Sign Out" variant="danger" onPress={() => signOut()} />
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
  profileSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
    gap: 14,
    alignSelf: 'center',
  },
  avatarWrap: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: 'rgba(255,255,255,0.10)',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: theme.colors.primary,
  },
  avatarImg: {
    width: 54,
    height: 54,
    borderRadius: 27,
  },
  avatarPlaceholder: {
    width: 54,
    height: 54,
    borderRadius: 27,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  profileInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  profileName: {
    fontFamily: theme.font.sansBold,
    fontSize: 17,
    color: theme.colors.text,
  },
  profileEmail: {
    fontFamily: theme.font.sans,
    fontSize: 13,
    color: theme.colors.textMuted,
    marginTop: 2,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 18,
    marginBottom: 2,
    gap: 7,
  },
  sectionIcon: {
    marginRight: 2,
  },
  sectionHeader: {
    fontFamily: theme.font.sansBold,
    fontSize: 16,
    color: theme.colors.primary,
    letterSpacing: 0.2,
  },
  stack: {
    gap: 8,
  },
  row: {
    fontFamily: theme.font.sans,
    color: theme.colors.text,
    fontSize: 15,
  },
});
