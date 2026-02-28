import { useQuery } from '@tanstack/react-query';
import { StyleSheet, Text, View } from 'react-native';
import { Screen } from '@/components/ui/Screen';
import { SectionCard } from '@/components/ui/SectionCard';
import { LoadingState } from '@/components/common/LoadingState';
import { ErrorBanner } from '@/components/common/ErrorBanner';
import { AdminNav } from '@/components/admin/AdminNav';
import { getAdminStats } from '@/lib/api/endpoints';
import { theme } from '@/lib/config/theme';

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );
}

export default function AdminDashboardScreen() {
  const statsQuery = useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: getAdminStats,
  });

  return (
    <Screen>
      <Text style={styles.title}>Admin Console</Text>
      <AdminNav active="dashboard" />

      {statsQuery.isLoading ? (
        <LoadingState label="Loading platform stats..." />
      ) : statsQuery.isError ? (
        <ErrorBanner message="Unable to load admin dashboard." />
      ) : (
        <SectionCard title="Platform Snapshot" subtitle="Live operational metrics">
          <View style={styles.grid}>
            <Stat label="Members Total" value={String(statsQuery.data?.membersTotal ?? 0)} />
            <Stat label="Active Members" value={String(statsQuery.data?.activeMembers ?? 0)} />
            <Stat label="Matches Total" value={String(statsQuery.data?.matchesTotal ?? 0)} />
            <Stat label="Pending Matches" value={String(statsQuery.data?.matchesPending ?? 0)} />
            <Stat label="VIP Members" value={String(statsQuery.data?.vipMembers ?? 0)} />
            <Stat label="Outstanding Credits" value={String(statsQuery.data?.priorityCreditsOutstanding ?? 0)} />
            <Stat label="Revenue KES" value={`KES ${Number(statsQuery.data?.revenueMonthKES ?? 0).toLocaleString()}`} />
            <Stat label="Revenue USD" value={`$ ${Number(statsQuery.data?.revenueMonthUSD ?? 0).toLocaleString()}`} />
          </View>
        </SectionCard>
      )}
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
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  stat: {
    width: '48%',
    minWidth: 130,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    backgroundColor: 'rgba(255,255,255,0.04)',
    padding: 12,
    gap: 4,
  },
  statLabel: {
    fontFamily: theme.font.sans,
    fontSize: 11,
    color: theme.colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.7,
  },
  statValue: {
    fontFamily: theme.font.sansBold,
    color: theme.colors.text,
    fontSize: 16,
  },
});
