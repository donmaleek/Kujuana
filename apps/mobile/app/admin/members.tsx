import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { Screen } from '@/components/ui/Screen';
import { SectionCard } from '@/components/ui/SectionCard';
import { LoadingState } from '@/components/common/LoadingState';
import { ErrorBanner } from '@/components/common/ErrorBanner';
import { AdminNav } from '@/components/admin/AdminNav';
import { listAdminMembers } from '@/lib/api/endpoints';
import { theme } from '@/lib/config/theme';

export default function AdminMembersScreen() {
  const [query, setQuery] = useState('');
  const membersQuery = useQuery({
    queryKey: ['admin', 'members'],
    queryFn: listAdminMembers,
  });

  const filteredMembers = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return membersQuery.data ?? [];
    return (membersQuery.data ?? []).filter((member) =>
      `${member.fullName} ${member.email}`.toLowerCase().includes(normalized),
    );
  }, [membersQuery.data, query]);

  return (
    <Screen>
      <Text style={styles.title}>Members</Text>
      <AdminNav active="members" />

      <View style={styles.searchWrap}>
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search name or email"
          placeholderTextColor="rgba(196,168,130,0.55)"
          style={styles.searchInput}
        />
      </View>

      {membersQuery.isLoading ? <LoadingState label="Loading members..." /> : null}
      {membersQuery.isError ? <ErrorBanner message="Unable to load members." /> : null}

      {filteredMembers.map((member) => (
        <SectionCard key={member.id} title={member.fullName} subtitle={member.email}>
          <Text style={styles.meta}>Tier: {member.tier}</Text>
          <Text style={styles.meta}>Completeness: {Math.round(member.profileCompleteness)}%</Text>
          <Text style={styles.meta}>Status: {member.isActive ? 'Active' : 'Inactive'}</Text>
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
  searchWrap: {
    marginBottom: 8,
  },
  searchInput: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.05)',
    color: theme.colors.text,
    fontFamily: theme.font.sans,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  meta: {
    fontFamily: theme.font.sans,
    color: theme.colors.text,
    fontSize: 13,
  },
});
