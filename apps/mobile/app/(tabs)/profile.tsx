import { StyleSheet, Text } from 'react-native';
import { Screen } from '@/components/ui/Screen';
import { SectionCard } from '@/components/ui/SectionCard';
import { useAuthStore } from '@/store/auth-store';
import { theme } from '@/lib/config/theme';

export default function ProfileTabScreen() {
  const profile = useAuthStore((state) => state.profile);

  return (
    <Screen>
      <SectionCard title="Profile snapshot" subtitle="This reflects your live profile model.">
        <Text style={styles.kpi}>{profile?.completeness?.overall ?? 0}%</Text>
        <Text style={styles.row}>Onboarding step: {profile?.onboardingStep ?? 1}</Text>
        <Text style={styles.row}>Photos uploaded: {profile?.photos?.length ?? 0}</Text>
        <Text style={styles.row}>Submitted: {profile?.isSubmitted ? 'Yes' : 'No'}</Text>
      </SectionCard>

      <SectionCard title="Basic" subtitle="Identity details">
        <Text style={styles.row}>Gender: {String(profile?.basic?.gender ?? 'Not set')}</Text>
        <Text style={styles.row}>Country: {String(profile?.basic?.country ?? 'Not set')}</Text>
        <Text style={styles.row}>City: {String(profile?.basic?.city ?? 'Not set')}</Text>
        <Text style={styles.row}>Religion: {String(profile?.basic?.religion ?? 'Not set')}</Text>
      </SectionCard>

      <SectionCard title="Vision" subtitle="Relationship orientation">
        <Text style={styles.row}>Type: {String(profile?.vision?.relationshipType ?? 'Not set')}</Text>
        <Text style={styles.row}>
          Core values: {Array.isArray(profile?.vision?.coreValues) ? profile?.vision?.coreValues?.join(', ') : 'Not set'}
        </Text>
      </SectionCard>
    </Screen>
  );
}

const styles = StyleSheet.create({
  kpi: {
    fontFamily: theme.font.serif,
    fontSize: 40,
    color: theme.colors.primary,
  },
  row: {
    fontFamily: theme.font.sans,
    color: theme.colors.text,
    fontSize: 14,
  },
});
