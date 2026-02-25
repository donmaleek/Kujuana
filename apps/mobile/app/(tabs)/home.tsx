import { useQuery } from '@tanstack/react-query';
import { StyleSheet, Text, View } from 'react-native';
import { listNotifications } from '@/lib/api/endpoints';
import { useAuthStore } from '@/store/auth-store';
import { Screen } from '@/components/ui/Screen';
import { SectionCard } from '@/components/ui/SectionCard';
import { LoadingState } from '@/components/common/LoadingState';
import { theme } from '@/lib/config/theme';

export default function HomeTabScreen() {
  const profile = useAuthStore((state) => state.profile);

  const notificationsQuery = useQuery({
    queryKey: ['notifications', 'home-preview'],
    queryFn: () => listNotifications(1, 4),
  });

  return (
    <Screen>
      <View style={styles.hero}>
        <Text style={styles.greeting}>Welcome back</Text>
        <Text style={styles.headline}>Your profile is {profile?.completeness?.overall ?? 0}% ready for precision matching.</Text>
      </View>

      <SectionCard title="Profile readiness">
        <Text style={styles.kpi}>{profile?.completeness?.overall ?? 0}%</Text>
        <Text style={styles.copy}>Higher completeness improves compatibility scoring and match quality.</Text>
      </SectionCard>

      <SectionCard title="Latest notifications">
        {notificationsQuery.isLoading ? (
          <LoadingState label="Loading notifications..." />
        ) : notificationsQuery.data?.items.length ? (
          notificationsQuery.data.items.map((item) => (
            <View key={item._id} style={styles.notificationItem}>
              <Text style={styles.notificationTitle}>{item.title}</Text>
              <Text style={styles.notificationBody}>{item.body}</Text>
            </View>
          ))
        ) : (
          <Text style={styles.copy}>No notifications yet.</Text>
        )}
      </SectionCard>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: {
    gap: 8,
  },
  greeting: {
    fontFamily: theme.font.sans,
    color: theme.colors.textMuted,
    fontSize: 14,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  headline: {
    fontFamily: theme.font.serif,
    color: theme.colors.text,
    fontSize: 32,
    lineHeight: 38,
  },
  kpi: {
    fontFamily: theme.font.serif,
    color: theme.colors.primary,
    fontSize: 44,
  },
  copy: {
    fontFamily: theme.font.sans,
    color: theme.colors.text,
    fontSize: 14,
    lineHeight: 21,
  },
  notificationItem: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 12,
    backgroundColor: theme.colors.card,
    padding: 10,
    gap: 4,
  },
  notificationTitle: {
    fontFamily: theme.font.sansBold,
    color: theme.colors.text,
  },
  notificationBody: {
    fontFamily: theme.font.sans,
    color: theme.colors.textMuted,
    fontSize: 13,
  },
});
