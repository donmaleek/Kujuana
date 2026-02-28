import { useQuery } from '@tanstack/react-query';
import { StyleSheet, Text } from 'react-native';
import { Screen } from '@/components/ui/Screen';
import { SectionCard } from '@/components/ui/SectionCard';
import { LoadingState } from '@/components/common/LoadingState';
import { ErrorBanner } from '@/components/common/ErrorBanner';
import { AdminNav } from '@/components/admin/AdminNav';
import { listAdminAudit } from '@/lib/api/endpoints';
import { theme } from '@/lib/config/theme';

export default function AdminAuditScreen() {
  const auditQuery = useQuery({
    queryKey: ['admin', 'audit'],
    queryFn: listAdminAudit,
  });

  return (
    <Screen>
      <Text style={styles.title}>Audit Logs</Text>
      <AdminNav active="audit" />

      {auditQuery.isLoading ? <LoadingState label="Loading audit events..." /> : null}
      {auditQuery.isError ? <ErrorBanner message="Unable to load audit logs." /> : null}

      {(auditQuery.data ?? []).map((row) => (
        <SectionCard
          key={row.id}
          title={row.action}
          subtitle={`${row.actor} • ${new Date(row.createdAt).toLocaleString()}`}
        >
          <Text style={styles.meta}>Target: {row.target ?? '—'}</Text>
          <Text style={styles.meta}>IP: {row.ip ?? '—'}</Text>
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
});
