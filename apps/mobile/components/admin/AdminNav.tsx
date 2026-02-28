import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { theme } from '@/lib/config/theme';

const tabs = [
  { key: 'dashboard', label: 'Dashboard', href: '/admin/dashboard' as const },
  { key: 'queue', label: 'Queue', href: '/admin/queue' as const },
  { key: 'members', label: 'Members', href: '/admin/members' as const },
  { key: 'audit', label: 'Audit', href: '/admin/audit' as const },
];

export function AdminNav({ active }: { active: 'dashboard' | 'queue' | 'members' | 'audit' }) {
  return (
    <View style={styles.row}>
      {tabs.map((tab) => (
        <Pressable
          key={tab.key}
          onPress={() => router.replace(tab.href)}
          style={[styles.tab, active === tab.key && styles.tabActive]}
        >
          <Text style={[styles.tabText, active === tab.key && styles.tabTextActive]}>{tab.label}</Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tab: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  tabActive: {
    borderColor: 'rgba(212,175,55,0.5)',
    backgroundColor: 'rgba(212,175,55,0.14)',
  },
  tabText: {
    fontFamily: theme.font.sans,
    fontSize: 12,
    color: theme.colors.textMuted,
  },
  tabTextActive: {
    fontFamily: theme.font.sansBold,
    color: theme.colors.primary,
  },
});
