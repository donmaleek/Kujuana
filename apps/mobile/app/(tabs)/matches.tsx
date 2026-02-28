import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { listMatches, requestPriorityMatch } from '@/lib/api/endpoints';
import { type MatchItem, ApiError } from '@/lib/api/types';
import { SkeletonBlock } from '@/components/ui/SkeletonLoader';
import { ProfileAvatar } from '@/components/ui/ProfileAvatar';
import { humanize } from '@/lib/utils/format';
import { theme } from '@/lib/config/theme';

type FilterTab = 'all' | 'pending' | 'active' | 'responded';

const FILTERS: { key: FilterTab; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'pending', label: 'Pending' },
  { key: 'active', label: 'Active' },
  { key: 'responded', label: 'Responded' },
];

function scoreColor(score: number) {
  if (score >= 80) return theme.colors.success;
  if (score >= 60) return theme.colors.primary;
  return '#FF8FA3';
}

function tierColors(tier: string): [string, string] {
  if (tier === 'vip') return ['#FFE680', '#D9A300'];
  if (tier === 'priority') return ['#C084FC', '#7C3AED'];
  return ['#6EDBB0', '#059669'];
}

function statusConfig(status: string, userAction: string) {
  if (userAction === 'accepted') return { label: 'Accepted', color: theme.colors.success, icon: 'checkmark-circle' as const };
  if (userAction === 'declined') return { label: 'Declined', color: theme.colors.error, icon: 'close-circle' as const };
  if (status === 'expired') return { label: 'Expired', color: theme.colors.textMuted, icon: 'time' as const };
  if (status === 'active') return { label: 'Respond', color: theme.colors.primary, icon: 'ellipse' as const };
  return { label: 'New', color: theme.colors.primary, icon: 'sparkles' as const };
}

function filterMatches(matches: MatchItem[], filter: FilterTab) {
  if (filter === 'all') return matches;
  if (filter === 'pending') return matches.filter((m) => m.userAction === 'pending' && m.status !== 'expired');
  if (filter === 'active') return matches.filter((m) => m.status === 'active');
  return matches.filter((m) => m.userAction === 'accepted' || m.userAction === 'declined');
}

export default function MatchesTabScreen() {
  const queryClient = useQueryClient();
  const [activeFilter, setActiveFilter] = useState<FilterTab>('all');
  const [flashMessage, setFlashMessage] = useState('');
  const [flashIsError, setFlashIsError] = useState(false);

  const matchesQuery = useQuery({
    queryKey: ['matches'],
    queryFn: listMatches,
  });

  const priorityMutation = useMutation({
    mutationFn: requestPriorityMatch,
    onSuccess: (result) => {
      setFlashIsError(false);
      setFlashMessage(result.message);
      queryClient.invalidateQueries({ queryKey: ['matches'] });
      setTimeout(() => setFlashMessage(''), 4000);
    },
    onError: (error) => {
      setFlashIsError(true);
      setFlashMessage(
        error instanceof ApiError || error instanceof Error
          ? error.message
          : 'Unable to queue priority request.',
      );
      setTimeout(() => setFlashMessage(''), 4000);
    },
  });

  const allMatches = matchesQuery.data ?? [];
  const filtered = filterMatches(allMatches, activeFilter);
  const pendingCount = allMatches.filter((m) => m.userAction === 'pending' && m.status !== 'expired').length;

  return (
    <LinearGradient
      colors={[theme.colors.canvasDeep, theme.colors.canvas, '#25103C', theme.colors.canvasStrong, theme.colors.canvasDeep]}
      style={styles.flex}
    >
      <View style={[styles.glow, styles.glowTopRight]} />
      <SafeAreaView style={styles.flex}>
        {/* ── Header ── */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerSub}>KUJUANA</Text>
            <Text style={styles.headerTitle}>Your Matches</Text>
          </View>
          {pendingCount > 0 && (
            <View style={styles.pendingBubble}>
              <Text style={styles.pendingBubbleText}>{pendingCount} pending</Text>
            </View>
          )}
        </View>

        {/* ── Flash banner ── */}
        {flashMessage ? (
          <View style={[styles.flash, flashIsError ? styles.flashError : styles.flashSuccess]}>
            <Ionicons
              name={flashIsError ? 'alert-circle-outline' : 'checkmark-circle-outline'}
              size={14}
              color={flashIsError ? theme.colors.error : theme.colors.success}
            />
            <Text style={[styles.flashText, { color: flashIsError ? theme.colors.error : theme.colors.success }]}>
              {flashMessage}
            </Text>
          </View>
        ) : null}

        {/* ── Filter tabs ── */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterRow}
        >
          {FILTERS.map((f) => (
            <Pressable
              key={f.key}
              style={[styles.filterChip, activeFilter === f.key && styles.filterChipActive]}
              onPress={() => setActiveFilter(f.key)}
            >
              {activeFilter === f.key ? (
                <LinearGradient
                  colors={['#FFE680', '#FFD700', '#D9A300']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.filterChipGrad}
                >
                  <Text style={styles.filterChipTextActive}>{f.label}</Text>
                </LinearGradient>
              ) : (
                <Text style={styles.filterChipText}>{f.label}</Text>
              )}
            </Pressable>
          ))}
        </ScrollView>

        {/* ── Match list ── */}
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={matchesQuery.isFetching}
              onRefresh={() => matchesQuery.refetch()}
              tintColor={theme.colors.primary}
              colors={[theme.colors.primary]}
            />
          }
        >
          {matchesQuery.isLoading ? (
            <View style={styles.skeletonList}>
              {[0, 1, 2].map((i) => (
                <View key={i} style={styles.skeletonCard}>
                  <SkeletonBlock lines={3} gap={10} />
                </View>
              ))}
            </View>
          ) : matchesQuery.isError ? (
            <ErrorState onRetry={() => matchesQuery.refetch()} />
          ) : filtered.length === 0 ? (
            <EmptyState filter={activeFilter} totalCount={allMatches.length} />
          ) : (
            <View style={styles.cardList}>
              {filtered.map((match, idx) => (
                <MatchCard key={match._id} match={match} index={idx} />
              ))}
            </View>
          )}
        </ScrollView>

        {/* ── Priority match FAB ── */}
        <View style={styles.fabWrap}>
          <Pressable
            style={styles.fab}
            onPress={() => priorityMutation.mutate()}
            disabled={priorityMutation.isPending}
          >
            <LinearGradient
              colors={['#C084FC', '#7C3AED']}
              start={{ x: 0.1, y: 0.1 }}
              end={{ x: 0.9, y: 0.9 }}
              style={styles.fabGrad}
            >
              <Ionicons
                name={priorityMutation.isPending ? 'hourglass-outline' : 'flash'}
                size={18}
                color="#fff"
              />
              <Text style={styles.fabText}>
                {priorityMutation.isPending ? 'Requesting...' : 'Priority Match'}
              </Text>
            </LinearGradient>
          </Pressable>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

function MatchCard({ match, index }: { match: MatchItem; index: number }) {
  const sc = scoreColor(match.score);
  const tc = tierColors(match.tier);
  const st = statusConfig(match.status, match.userAction);

  const date = new Date(match.createdAt).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    <Pressable
      style={styles.card}
      onPress={() => router.push({ pathname: '/match/[id]', params: { id: match._id } })}
    >
      <LinearGradient
        colors={['rgba(255,255,255,0.09)', 'rgba(255,255,255,0.04)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.cardGrad}
      >
        {/* Left: avatar */}
        <ProfileAvatar initials={`M${index + 1}`} size={56} tier={match.tier} />

        {/* Middle: info */}
        <View style={styles.cardInfo}>
          <View style={styles.cardTopRow}>
            <LinearGradient
              colors={tc}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.tierPill}
            >
              <Text style={styles.tierPillText}>{humanize(match.tier)}</Text>
            </LinearGradient>
            <View style={[styles.statusPill, { borderColor: `${st.color}50`, backgroundColor: `${st.color}15` }]}>
              <Ionicons name={st.icon} size={11} color={st.color} />
              <Text style={[styles.statusPillText, { color: st.color }]}>{st.label}</Text>
            </View>
          </View>
          <Text style={styles.cardDate}>{date}</Text>
          {match.introductionNote ? (
            <Text style={styles.cardNote} numberOfLines={1}>{match.introductionNote}</Text>
          ) : null}
        </View>

        {/* Right: score */}
        <View style={[styles.scoreRing, { borderColor: sc }]}>
          <Text style={[styles.scoreNum, { color: sc }]}>{match.score}</Text>
          <Text style={[styles.scoreSuffix, { color: sc }]}>%</Text>
        </View>
      </LinearGradient>
    </Pressable>
  );
}

function EmptyState({ filter, totalCount }: { filter: FilterTab; totalCount: number }) {
  const isFiltered = filter !== 'all' && totalCount > 0;
  return (
    <View style={styles.emptyWrap}>
      <Ionicons name="heart-dislike-outline" size={48} color={theme.colors.textMuted} />
      <Text style={styles.emptyTitle}>
        {isFiltered ? `No ${filter} matches` : 'No matches yet'}
      </Text>
      <Text style={styles.emptyBody}>
        {isFiltered
          ? 'Try a different filter to see your other matches.'
          : 'Your matching queue is active. Check back soon or request a priority match below.'}
      </Text>
    </View>
  );
}

function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <View style={styles.emptyWrap}>
      <Ionicons name="wifi-outline" size={40} color={theme.colors.error} />
      <Text style={styles.emptyTitle}>Could not load matches</Text>
      <Pressable style={styles.retryBtn} onPress={onRetry}>
        <Text style={styles.retryText}>Try again</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  glow: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 300,
    backgroundColor: 'rgba(227,193,111,0.10)',
    top: -130,
    right: -140,
  },
  glowTopRight: {},

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 10,
  },
  headerSub: {
    fontFamily: theme.font.sans,
    color: theme.colors.textMuted,
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  headerTitle: {
    fontFamily: theme.font.sansBold,
    color: theme.colors.text,
    fontSize: 22,
  },
  pendingBubble: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    backgroundColor: 'rgba(255,215,0,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255,215,0,0.35)',
  },
  pendingBubbleText: {
    fontFamily: theme.font.sansBold,
    color: theme.colors.primary,
    fontSize: 11,
  },

  flash: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginHorizontal: 16,
    marginBottom: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  flashSuccess: {
    backgroundColor: theme.colors.successSurface,
    borderColor: `${theme.colors.success}40`,
  },
  flashError: {
    backgroundColor: theme.colors.errorSurface,
    borderColor: `${theme.colors.error}40`,
  },
  flashText: { fontFamily: theme.font.sans, fontSize: 12, flex: 1 },

  filterRow: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 8,
    flexDirection: 'row',
  },
  filterChip: {
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  filterChipActive: { borderColor: 'transparent' },
  filterChipGrad: { paddingHorizontal: 16, paddingVertical: 7, borderRadius: 20 },
  filterChipText: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    fontFamily: theme.font.sans,
    color: theme.colors.textMuted,
    fontSize: 13,
  },
  filterChipTextActive: {
    fontFamily: theme.font.sansBold,
    color: '#1C102D',
    fontSize: 13,
  },

  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingBottom: 100, gap: 12 },

  skeletonList: { gap: 12 },
  skeletonCard: {
    padding: 16,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },

  cardList: { gap: 12 },
  card: { borderRadius: 18, overflow: 'hidden' },
  cardGrad: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
  },
  cardInfo: { flex: 1, gap: 5 },
  cardTopRow: { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
  tierPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  tierPillText: { fontFamily: theme.font.sansBold, fontSize: 10, color: '#1C102D' },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    borderWidth: 1,
  },
  statusPillText: { fontFamily: theme.font.sans, fontSize: 10 },
  cardDate: { fontFamily: theme.font.sans, color: theme.colors.textMuted, fontSize: 11 },
  cardNote: { fontFamily: theme.font.sans, color: theme.colors.textMuted, fontSize: 12, fontStyle: 'italic' },

  scoreRing: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 2.5,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.04)',
    flexShrink: 0,
  },
  scoreNum: { fontFamily: theme.font.sansBold, fontSize: 16, lineHeight: 18 },
  scoreSuffix: { fontFamily: theme.font.sans, fontSize: 9, lineHeight: 10 },

  fabWrap: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    alignItems: 'center',
    pointerEvents: 'box-none',
  },
  fab: { borderRadius: 28, overflow: 'hidden', elevation: 12, shadowColor: '#7C3AED', shadowOpacity: 0.4, shadowRadius: 12, shadowOffset: { width: 0, height: 4 } },
  fabGrad: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 28,
  },
  fabText: { fontFamily: theme.font.sansBold, color: '#fff', fontSize: 14 },

  emptyWrap: { alignItems: 'center', paddingTop: 60, paddingHorizontal: 32, gap: 12 },
  emptyTitle: { fontFamily: theme.font.sansBold, color: theme.colors.text, fontSize: 18 },
  emptyBody: {
    fontFamily: theme.font.sans,
    color: theme.colors.textMuted,
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 20,
  },
  retryBtn: {
    marginTop: 8,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: theme.colors.error,
  },
  retryText: { fontFamily: theme.font.sansBold, color: theme.colors.error, fontSize: 13 },
});
