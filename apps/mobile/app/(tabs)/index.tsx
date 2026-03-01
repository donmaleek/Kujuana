import { ActivityIndicator, Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import type { ComponentProps } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { AppScreen } from '@/components/ui/AppScreen';
import { FadeIn } from '@/components/ui/FadeIn';
import { GlassCard } from '@/components/ui/GlassCard';
import { GoldButton } from '@/components/ui/GoldButton';
import { TabScreenHeader } from '@/components/ui/TabScreenHeader';
import { COLORS, FONT, GRADIENTS, RADIUS } from '@/lib/theme/tokens';
import { useAppData } from '@/lib/state/app-data';
import { useSession } from '@/lib/state/session';

type MetricTileProps = {
  label: string;
  value: string;
  icon: ComponentProps<typeof MaterialCommunityIcons>['name'];
};

type NextAction = {
  id: string;
  title: string;
  subtitle: string;
  due: string;
  cta: string;
  icon: ComponentProps<typeof MaterialCommunityIcons>['name'];
  onPress: () => void;
};

function MetricTile({ label, value, icon }: MetricTileProps) {
  return (
    <GlassCard style={styles.metricCard}>
      <MaterialCommunityIcons name={icon} size={18} color={COLORS.goldChampagne} />
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
    </GlassCard>
  );
}

function formatDueLabel(input: string): string {
  const date = new Date(input);
  if (Number.isNaN(date.getTime())) return 'Soon';
  return date.toLocaleDateString('en-KE', { day: 'numeric', month: 'short' });
}

export default function OverviewScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isCompact = width < 390;

  const { user } = useSession();
  const { profile, matches, loading, refreshing, error, refreshAll } = useAppData();

  const completion = Math.min(100, Math.max(0, Math.round(profile?.completeness ?? 0)));
  const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const curatedThisWeek = matches.filter((item) => {
    if (!item.createdAt) return false;
    const created = new Date(item.createdAt).getTime();
    return Number.isFinite(created) && created >= weekAgo;
  }).length;

  const responses = matches.filter((item) => item.userAction === 'accepted' || item.userAction === 'declined').length;
  const responseRate = matches.length ? Math.round((responses / matches.length) * 100) : 0;
  const activeChats = matches.filter((item) => item.userAction === 'accepted').length;
  const pendingMatches = matches.filter((item) => item.userAction === 'pending').length;
  const tier = (profile?.tier || user?.tier || 'standard').toUpperCase();

  const nextActions: NextAction[] = [
    {
      id: 'complete-profile',
      title: completion < 100 ? 'Continue profile setup' : 'Polish your profile details',
      subtitle:
        completion < 100
          ? 'Complete your details to improve matchmaking quality and visibility.'
          : 'Keep your details current to maintain high-quality curated intros.',
      due: `${completion}%`,
      cta: 'Continue',
      icon: 'account-edit-outline',
      onPress: () => router.push('/(tabs)/profile'),
    },
    {
      id: 'manage-plan',
      title: 'Review membership and credits',
      subtitle: 'Track your plan, renewal status, and available priority credits.',
      due: tier,
      cta: 'Open plan',
      icon: 'crown-outline',
      onPress: () => router.push('/(tabs)/subscription'),
    },
    {
      id: 'respond-matches',
      title:
        pendingMatches > 0
          ? `Respond to ${pendingMatches} pending ${pendingMatches === 1 ? 'intro' : 'intros'}`
          : 'Check your latest matches',
      subtitle:
        pendingMatches > 0
          ? 'Timely responses increase your matching momentum.'
          : 'Open your match feed and review new introductions.',
      due: pendingMatches > 0 ? 'Today' : formatDueLabel(new Date().toISOString()),
      cta: 'Open matches',
      icon: 'heart-multiple-outline',
      onPress: () => router.push('/(tabs)/matches'),
    },
  ];

  return (
    <AppScreen>
      <FadeIn>
        <TabScreenHeader
          title="Overview"
          subtitle="Track your profile momentum, curated intros, and next high-impact actions."
        />
      </FadeIn>

      <FadeIn delay={100}>
        <GlassCard highlighted>
          <View style={styles.cardHeaderRow}>
            <View>
              <Text style={styles.cardEyebrow}>Overview</Text>
              <Text style={styles.cardTitle}>{`Welcome, ${user?.fullName?.split(' ')[0] ?? 'Member'}`}</Text>
              <Text style={styles.cardSubtitle}>{`${curatedThisWeek} curated ${curatedThisWeek === 1 ? 'match' : 'matches'} this week`}</Text>
            </View>
            <MaterialCommunityIcons name="star-four-points" color={COLORS.goldChampagne} size={22} />
          </View>

          <View style={styles.progressTrack}>
            <LinearGradient colors={GRADIENTS.gold} style={[styles.progressFill, { width: `${completion}%` }]} />
          </View>
          <View style={styles.progressRow}>
            <Text style={styles.progressText}>Profile completion</Text>
            <Text style={styles.progressValue}>{completion}%</Text>
          </View>

          <View style={[styles.actionsRow, isCompact && styles.actionsRowCompact]}>
            <GoldButton
              label={completion < 100 ? 'Continue profile' : 'View profile'}
              style={styles.actionButton}
              onPress={() => router.push('/(tabs)/profile')}
            />
            <GoldButton
              label={refreshing ? 'Refreshing...' : 'Refresh data'}
              outlined
              style={styles.actionButton}
              onPress={refreshAll}
            />
          </View>

          {loading ? (
            <View style={styles.loadingRow}>
              <ActivityIndicator size="small" color={COLORS.goldGlow} />
              <Text style={styles.loadingText}>Syncing profile, matches, and subscription...</Text>
            </View>
          ) : null}

          {error ? <Text style={styles.errorText}>{error}</Text> : null}
        </GlassCard>
      </FadeIn>

      <FadeIn delay={170}>
        <View style={[styles.metricsRow, isCompact && styles.metricsRowCompact]}>
          <MetricTile label="Response rate" value={`${responseRate}%`} icon="message-text-fast-outline" />
          <MetricTile label="Active chats" value={`${activeChats}`} icon="chat-processing-outline" />
          <MetricTile label="Pending" value={`${pendingMatches}`} icon="timer-sand" />
        </View>
      </FadeIn>

      <FadeIn delay={240}>
        <Text style={styles.sectionTitle}>Next steps</Text>
        {nextActions.map((action) => (
          <GlassCard key={action.id} style={styles.timelineCard}>
            <View style={styles.timelineHead}>
              <View style={styles.timelineIconWrap}>
                <MaterialCommunityIcons name={action.icon} size={16} color={COLORS.goldChampagne} />
              </View>
              <View style={styles.timelineBody}>
                <View style={styles.timelineTitleRow}>
                  <Text style={styles.timelineTitle}>{action.title}</Text>
                  <Text style={styles.timelineDue}>{action.due}</Text>
                </View>
                <Text style={styles.timelineSubtitle}>{action.subtitle}</Text>
                <Pressable onPress={action.onPress} style={({ pressed }) => [styles.timelineCta, pressed && styles.timelineCtaPressed]}>
                  <Text style={styles.timelineCtaText}>{action.cta}</Text>
                  <MaterialCommunityIcons name="chevron-right" size={16} color={COLORS.goldChampagne} />
                </Pressable>
              </View>
            </View>
          </GlassCard>
        ))}
      </FadeIn>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  cardEyebrow: {
    color: COLORS.goldChampagne,
    opacity: 0.78,
    fontFamily: FONT.bodyMedium,
    textTransform: 'uppercase',
    fontSize: 11,
    letterSpacing: 1,
  },
  cardTitle: {
    marginTop: 4,
    color: COLORS.offWhite,
    fontFamily: FONT.displayBold,
    fontSize: 30,
    lineHeight: 32,
    maxWidth: '92%',
  },
  cardSubtitle: {
    marginTop: 4,
    color: COLORS.textMuted,
    fontFamily: FONT.body,
    fontSize: 13,
  },
  progressTrack: {
    marginTop: 14,
    height: 8,
    borderRadius: RADIUS.pill,
    backgroundColor: 'rgba(255,255,255,0.10)',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: RADIUS.pill,
  },
  progressRow: {
    marginTop: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressText: {
    color: COLORS.textMuted,
    fontFamily: FONT.body,
    fontSize: 13,
  },
  progressValue: {
    color: COLORS.goldGlow,
    fontFamily: FONT.bodySemiBold,
    fontSize: 13,
  },
  actionsRow: {
    marginTop: 14,
    flexDirection: 'row',
    gap: 10,
  },
  actionsRowCompact: {
    flexDirection: 'column',
  },
  actionButton: {
    flex: 1,
  },
  loadingRow: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  loadingText: {
    color: COLORS.textMuted,
    fontFamily: FONT.body,
    fontSize: 12,
  },
  errorText: {
    marginTop: 8,
    color: COLORS.danger,
    fontFamily: FONT.body,
    fontSize: 12,
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  metricsRowCompact: {
    flexDirection: 'column',
  },
  metricCard: {
    flex: 1,
    alignItems: 'flex-start',
    gap: 8,
  },
  metricValue: {
    color: COLORS.offWhite,
    fontFamily: FONT.displayBold,
    fontSize: 28,
    lineHeight: 30,
  },
  metricLabel: {
    color: COLORS.textMuted,
    fontFamily: FONT.body,
    fontSize: 13,
  },
  sectionTitle: {
    marginTop: 6,
    color: COLORS.offWhite,
    fontFamily: FONT.display,
    fontSize: 25,
  },
  timelineCard: {
    paddingVertical: 14,
  },
  timelineHead: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  timelineIconWrap: {
    marginTop: 2,
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.strokeSoft,
    backgroundColor: 'rgba(255,255,255,0.03)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  timelineBody: {
    flex: 1,
  },
  timelineTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  timelineTitle: {
    color: COLORS.offWhite,
    fontFamily: FONT.bodySemiBold,
    fontSize: 15,
    flex: 1,
  },
  timelineDue: {
    color: COLORS.goldGlow,
    fontFamily: FONT.bodyMedium,
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  timelineSubtitle: {
    marginTop: 5,
    color: COLORS.textMuted,
    fontFamily: FONT.body,
    fontSize: 13,
    lineHeight: 18,
  },
  timelineCta: {
    marginTop: 10,
    alignSelf: 'flex-start',
    borderRadius: RADIUS.pill,
    borderWidth: 1,
    borderColor: COLORS.stroke,
    backgroundColor: 'rgba(212,175,55,0.08)',
    paddingVertical: 6,
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  timelineCtaPressed: {
    opacity: 0.84,
  },
  timelineCtaText: {
    color: COLORS.goldChampagne,
    fontFamily: FONT.bodySemiBold,
    fontSize: 12,
  },
});
