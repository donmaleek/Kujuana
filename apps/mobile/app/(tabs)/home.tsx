import { useQuery } from '@tanstack/react-query';
import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { listMatches, listNotifications } from '@/lib/api/endpoints';
import { useAuthStore } from '@/store/auth-store';
import { SkeletonBlock } from '@/components/ui/SkeletonLoader';
import { theme } from '@/lib/config/theme';

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

function scoreColor(pct: number) {
  if (pct >= 80) return theme.colors.success;
  if (pct >= 60) return theme.colors.primary;
  return '#FF8FA3';
}

function tierLabel(tier: string) {
  if (tier === 'vip') return 'VIP';
  if (tier === 'priority') return 'Priority';
  return 'Standard';
}

function tierColors(tier: string): [string, string] {
  if (tier === 'vip') return ['#FFE680', '#D9A300'];
  if (tier === 'priority') return ['#C084FC', '#7C3AED'];
  return ['#6EDBB0', '#059669'];
}

function timeSince(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function HomeTabScreen() {
  const profile = useAuthStore((state) => state.profile);
  const completeness = profile?.completeness?.overall ?? 0;
  const tier = (profile as any)?.subscription?.tier ?? 'standard';

  const notificationsQuery = useQuery({
    queryKey: ['notifications', 'home-preview'],
    queryFn: () => listNotifications(1, 4),
  });

  const matchesQuery = useQuery({
    queryKey: ['matches'],
    queryFn: listMatches,
  });

  const pendingMatches = (matchesQuery.data ?? []).filter(
    (m) => m.status === 'pending' || m.userAction === 'pending',
  ).length;

  const totalMatches = matchesQuery.data?.length ?? 0;

  function handleRefresh() {
    notificationsQuery.refetch();
    matchesQuery.refetch();
  }

  const refreshing = notificationsQuery.isFetching || matchesQuery.isFetching;

  return (
    <LinearGradient
      colors={[theme.colors.canvasDeep, theme.colors.canvas, '#25103C', theme.colors.canvasStrong, theme.colors.canvasDeep]}
      style={styles.flex}
    >
      <View style={[styles.glow, styles.glowTopRight]} />
      <View style={[styles.glow, styles.glowBottomLeft]} />
      <SafeAreaView style={styles.flex}>
        {/* ── Header ── */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greetingLabel}>{getGreeting()}</Text>
            <Text style={styles.brandName}>KUJUANA</Text>
          </View>
          <Pressable
            style={styles.bellWrap}
            onPress={() => router.push('/(tabs)/settings')}
            hitSlop={10}
          >
            <Ionicons name="notifications-outline" size={22} color={theme.colors.primary} />
            {notificationsQuery.data?.items.some((n) => n.status !== 'read') ? (
              <View style={styles.notifBadge} />
            ) : null}
          </Pressable>
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={theme.colors.primary}
              colors={[theme.colors.primary]}
            />
          }
        >
          {/* ── Profile power card ── */}
          <LinearGradient
            colors={['rgba(255,255,255,0.10)', 'rgba(255,255,255,0.04)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.powerCard}
          >
            <View style={styles.powerCardBorder} />
            <View style={styles.powerTop}>
              <View>
                <Text style={styles.powerLabel}>Profile Power</Text>
                <Text style={styles.powerPct}>{completeness}%</Text>
              </View>
              <View style={styles.tierBadge}>
                <LinearGradient
                  colors={tierColors(tier)}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.tierGrad}
                >
                  <Ionicons
                    name={tier === 'vip' ? 'diamond' : tier === 'priority' ? 'flash' : 'star-outline'}
                    size={11}
                    color="#1C102D"
                  />
                  <Text style={styles.tierText}>{tierLabel(tier)}</Text>
                </LinearGradient>
              </View>
            </View>
            <View style={styles.progressTrack}>
              <LinearGradient
                colors={['#FFE680', '#FFD700', '#D9A300']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[styles.progressFill, { width: `${completeness}%` }]}
              />
            </View>
            <Text style={styles.powerHint}>
              {completeness < 100
                ? `Add ${100 - completeness}% more to unlock precision matching`
                : 'Profile complete — precision matching active'}
            </Text>
            {completeness < 100 && (
              <Pressable
                style={styles.boostBtn}
                onPress={() => router.push('/(onboarding)/basic' as any)}
              >
                <Text style={styles.boostBtnText}>Complete Profile →</Text>
              </Pressable>
            )}
          </LinearGradient>

          {/* ── Stats row ── */}
          <View style={styles.statsRow}>
            <StatCard
              icon="heart"
              value={String(totalMatches)}
              label="Matches"
              iconColor={theme.colors.error}
              onPress={() => router.push('/(tabs)/matches')}
            />
            <StatCard
              icon="time-outline"
              value={String(pendingMatches)}
              label="Pending"
              iconColor={theme.colors.primary}
              onPress={() => router.push('/(tabs)/matches')}
            />
            <StatCard
              icon="trophy-outline"
              value={`${completeness}%`}
              label="Complete"
              iconColor={completeness >= 80 ? theme.colors.success : theme.colors.primary}
            />
          </View>

          {/* ── Recent activity ── */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Activity</Text>
            <Pressable onPress={() => router.push('/(tabs)/settings')}>
              <Text style={styles.sectionLink}>See all</Text>
            </Pressable>
          </View>

          {notificationsQuery.isLoading ? (
            <View style={styles.skeletonWrap}>
              <SkeletonBlock lines={3} gap={12} />
            </View>
          ) : notificationsQuery.data?.items.length ? (
            <View style={styles.notifList}>
              {notificationsQuery.data.items.map((item) => (
                <NotifCard key={item._id} item={item} />
              ))}
            </View>
          ) : (
            <EmptyActivity />
          )}

          {/* ── Latest matches preview ── */}
          {matchesQuery.data && matchesQuery.data.length > 0 && (
            <>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Recent Matches</Text>
                <Pressable onPress={() => router.push('/(tabs)/matches')}>
                  <Text style={styles.sectionLink}>View all</Text>
                </Pressable>
              </View>
              <View style={styles.matchPreviews}>
                {matchesQuery.data.slice(0, 3).map((match) => (
                  <Pressable
                    key={match._id}
                    style={styles.matchPreviewCard}
                    onPress={() =>
                      router.push({ pathname: '/match/[id]', params: { id: match._id } })
                    }
                  >
                    <View style={[styles.scoreRing, { borderColor: scoreColor(match.score) }]}>
                      <Text style={[styles.scoreNum, { color: scoreColor(match.score) }]}>
                        {match.score}
                      </Text>
                      <Text style={[styles.scorePct, { color: scoreColor(match.score) }]}>%</Text>
                    </View>
                    <View style={styles.matchPreviewInfo}>
                      <Text style={styles.matchPreviewTier}>{tierLabel(match.tier)}</Text>
                      <Text style={styles.matchPreviewStatus}>
                        {match.status === 'pending' ? 'Awaiting response' : match.status}
                      </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={16} color={theme.colors.textMuted} />
                  </Pressable>
                ))}
              </View>
            </>
          )}

          {/* ── Intro tip ── */}
          <LinearGradient
            colors={['rgba(125,87,201,0.20)', 'rgba(125,87,201,0.08)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.tipCard}
          >
            <Ionicons name="bulb-outline" size={18} color={theme.colors.secondary} />
            <Text style={styles.tipText}>
              Profiles with 3 photos and a complete vision statement receive 3× more priority matches.
            </Text>
          </LinearGradient>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

function StatCard({
  icon,
  value,
  label,
  iconColor,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  value: string;
  label: string;
  iconColor: string;
  onPress?: () => void;
}) {
  return (
    <Pressable style={styles.statCard} onPress={onPress}>
      <LinearGradient
        colors={['rgba(255,255,255,0.10)', 'rgba(255,255,255,0.04)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.statGrad}
      >
        <Ionicons name={icon} size={20} color={iconColor} />
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statLabel}>{label}</Text>
      </LinearGradient>
    </Pressable>
  );
}

function NotifCard({ item }: { item: { _id: string; title: string; body: string; status: string; createdAt: string } }) {
  const isUnread = item.status !== 'read';
  return (
    <View style={[styles.notifCard, isUnread && styles.notifCardUnread]}>
      <View style={styles.notifIcon}>
        <Ionicons
          name={isUnread ? 'notifications' : 'notifications-outline'}
          size={18}
          color={isUnread ? theme.colors.primary : theme.colors.textMuted}
        />
      </View>
      <View style={styles.notifBody}>
        <Text style={[styles.notifTitle, isUnread && styles.notifTitleUnread]}>{item.title}</Text>
        <Text style={styles.notifDesc} numberOfLines={2}>{item.body}</Text>
        <Text style={styles.notifTime}>{timeSince(item.createdAt)}</Text>
      </View>
      {isUnread && <View style={styles.unreadDot} />}
    </View>
  );
}

function EmptyActivity() {
  return (
    <View style={styles.emptyCard}>
      <Ionicons name="compass-outline" size={36} color={theme.colors.textMuted} />
      <Text style={styles.emptyTitle}>Your lounge is quiet</Text>
      <Text style={styles.emptyBody}>
        Complete your profile and our matching engine will begin curating your first introduction.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  glow: {
    position: 'absolute',
    width: 280,
    height: 280,
    borderRadius: 280,
    backgroundColor: 'rgba(227,193,111,0.14)',
  },
  glowTopRight: { top: -120, right: -130 },
  glowBottomLeft: { bottom: -160, left: -140, backgroundColor: 'rgba(125,87,201,0.14)' },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 12,
  },
  greetingLabel: {
    fontFamily: theme.font.sans,
    color: theme.colors.textMuted,
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  brandName: {
    fontFamily: theme.font.sansBold,
    color: theme.colors.primary,
    fontSize: 20,
    letterSpacing: 2,
    textShadowColor: 'rgba(255,215,0,0.4)',
    textShadowRadius: 8,
  },
  bellWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,215,0,0.10)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,215,0,0.25)',
  },
  notifBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.error,
    borderWidth: 1.5,
    borderColor: theme.colors.canvasStrong,
  },

  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingBottom: 32, gap: 16 },

  powerCard: {
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,215,0,0.25)',
    overflow: 'hidden',
    gap: 10,
  },
  powerCardBorder: {
    position: 'absolute',
    inset: 0,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,215,0,0.15)',
  },
  powerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  powerLabel: {
    fontFamily: theme.font.sans,
    color: theme.colors.textMuted,
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  powerPct: {
    fontFamily: theme.font.serif,
    color: theme.colors.primary,
    fontSize: 42,
    lineHeight: 48,
    textShadowColor: 'rgba(255,215,0,0.35)',
    textShadowRadius: 10,
  },
  tierBadge: { borderRadius: 20, overflow: 'hidden' },
  tierGrad: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  tierText: { fontFamily: theme.font.sansBold, fontSize: 11, color: '#1C102D' },
  progressTrack: {
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: { height: '100%', borderRadius: 3 },
  powerHint: {
    fontFamily: theme.font.sans,
    color: theme.colors.textMuted,
    fontSize: 12,
    lineHeight: 17,
  },
  boostBtn: {
    alignSelf: 'flex-start',
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,215,0,0.45)',
    backgroundColor: 'rgba(255,215,0,0.08)',
  },
  boostBtnText: {
    fontFamily: theme.font.sansBold,
    color: theme.colors.primary,
    fontSize: 12,
  },

  statsRow: { flexDirection: 'row', gap: 10 },
  statCard: { flex: 1, borderRadius: 16, overflow: 'hidden' },
  statGrad: {
    borderRadius: 16,
    padding: 14,
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
  },
  statValue: { fontFamily: theme.font.sansBold, color: theme.colors.text, fontSize: 20 },
  statLabel: { fontFamily: theme.font.sans, color: theme.colors.textMuted, fontSize: 11 },

  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  sectionTitle: {
    fontFamily: theme.font.sansBold,
    color: theme.colors.text,
    fontSize: 15,
    letterSpacing: 0.3,
  },
  sectionLink: {
    fontFamily: theme.font.sans,
    color: theme.colors.primary,
    fontSize: 12,
  },

  skeletonWrap: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16,
    padding: 16,
  },

  notifList: { gap: 10 },
  notifCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    padding: 14,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  notifCardUnread: {
    borderColor: 'rgba(255,215,0,0.25)',
    backgroundColor: 'rgba(255,215,0,0.06)',
  },
  notifIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,215,0,0.10)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  notifBody: { flex: 1, gap: 2 },
  notifTitle: {
    fontFamily: theme.font.sans,
    color: theme.colors.text,
    fontSize: 13,
  },
  notifTitleUnread: { fontFamily: theme.font.sansBold },
  notifDesc: {
    fontFamily: theme.font.sans,
    color: theme.colors.textMuted,
    fontSize: 12,
    lineHeight: 17,
  },
  notifTime: {
    fontFamily: theme.font.sans,
    color: 'rgba(184,169,205,0.55)',
    fontSize: 10,
    marginTop: 2,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.primary,
    marginTop: 4,
  },

  matchPreviews: { gap: 10 },
  matchPreviewCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 14,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  scoreRing: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 2.5,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  scoreNum: {
    fontFamily: theme.font.sansBold,
    fontSize: 16,
    lineHeight: 18,
  },
  scorePct: {
    fontFamily: theme.font.sans,
    fontSize: 9,
    lineHeight: 10,
  },
  matchPreviewInfo: { flex: 1, gap: 2 },
  matchPreviewTier: {
    fontFamily: theme.font.sansBold,
    color: theme.colors.primary,
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  matchPreviewStatus: {
    fontFamily: theme.font.sans,
    color: theme.colors.textMuted,
    fontSize: 12,
    textTransform: 'capitalize',
  },

  tipCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(125,87,201,0.30)',
  },
  tipText: {
    flex: 1,
    fontFamily: theme.font.sans,
    color: theme.colors.textMuted,
    fontSize: 12,
    lineHeight: 18,
  },

  emptyCard: {
    alignItems: 'center',
    gap: 10,
    padding: 28,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
  },
  emptyTitle: {
    fontFamily: theme.font.sansBold,
    color: theme.colors.text,
    fontSize: 15,
  },
  emptyBody: {
    fontFamily: theme.font.sans,
    color: theme.colors.textMuted,
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 19,
  },
});
