import { useMemo, useState } from 'react';
import { useLocalSearchParams, router } from 'expo-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getMatch, respondToMatch } from '@/lib/api/endpoints';
import { ApiError } from '@/lib/api/types';
import { ProfileAvatar } from '@/components/ui/ProfileAvatar';
import { SkeletonBlock } from '@/components/ui/SkeletonLoader';
import { humanize } from '@/lib/utils/format';
import { theme } from '@/lib/config/theme';

const DIMENSION_LABELS: Record<string, string> = {
  values: 'Core Values',
  lifestyle: 'Lifestyle',
  location: 'Location',
  religion: 'Faith & Belief',
  ageCompatibility: 'Age Match',
  vision: 'Life Vision',
  preferences: 'Preferences',
  total: 'Overall',
};

function scoreColor(score: number) {
  if (score >= 80) return theme.colors.success;
  if (score >= 60) return theme.colors.primary;
  return theme.colors.error;
}

function tierColors(tier: string): [string, string] {
  if (tier === 'vip') return ['#FFE680', '#D9A300'];
  if (tier === 'priority') return ['#C084FC', '#7C3AED'];
  return ['#6EDBB0', '#059669'];
}

function statusMeta(status: string) {
  const map: Record<string, { label: string; color: string; icon: keyof typeof Ionicons.glyphMap }> = {
    active: { label: 'Active', color: theme.colors.primary, icon: 'ellipse' },
    accepted: { label: 'Accepted', color: theme.colors.success, icon: 'checkmark-circle' },
    declined: { label: 'Declined', color: theme.colors.error, icon: 'close-circle' },
    pending: { label: 'Pending', color: theme.colors.textMuted, icon: 'time-outline' },
    expired: { label: 'Expired', color: theme.colors.textMuted, icon: 'time' },
  };
  return map[status] ?? map.pending;
}

export default function MatchDetailScreen() {
  const params = useLocalSearchParams<{ id?: string }>();
  const matchId = useMemo(() => {
    if (Array.isArray(params.id)) return params.id[0] ?? '';
    return params.id ?? '';
  }, [params.id]);

  const queryClient = useQueryClient();
  const [flashMessage, setFlashMessage] = useState('');
  const [flashIsError, setFlashIsError] = useState(false);

  const matchQuery = useQuery({
    queryKey: ['match', matchId],
    queryFn: () => getMatch(matchId),
    enabled: Boolean(matchId),
  });

  const respondMutation = useMutation({
    mutationFn: (action: 'accepted' | 'declined') => respondToMatch(matchId, action),
    onSuccess: () => {
      setFlashIsError(false);
      setFlashMessage('Response recorded successfully.');
      queryClient.invalidateQueries({ queryKey: ['matches'] });
      queryClient.invalidateQueries({ queryKey: ['match', matchId] });
    },
    onError: (error) => {
      setFlashIsError(true);
      setFlashMessage(
        error instanceof ApiError || error instanceof Error
          ? error.message
          : 'Could not submit response.',
      );
    },
  });

  const match = matchQuery.data;
  const sc = match ? scoreColor(match.score) : theme.colors.primary;
  const sm = match ? statusMeta(match.status) : statusMeta('pending');
  const tc = match ? tierColors(match.tier) : (['#6EDBB0', '#059669'] as [string, string]);

  const alreadyResponded =
    match?.userAction === 'accepted' || match?.userAction === 'declined';

  return (
    <LinearGradient
      colors={[theme.colors.canvasDeep, theme.colors.canvas, '#25103C', theme.colors.canvasStrong, theme.colors.canvasDeep]}
      style={styles.flex}
    >
      <View style={[styles.glow, styles.glowTop]} />
      <SafeAreaView style={styles.flex}>
        {/* ── Nav bar ── */}
        <View style={styles.navbar}>
          <Pressable style={styles.backBtn} onPress={() => router.back()} hitSlop={10}>
            <Ionicons name="chevron-back" size={20} color={theme.colors.primary} />
            <Text style={styles.backText}>Matches</Text>
          </Pressable>
          <Text style={styles.navTitle}>Match Detail</Text>
          <View style={{ width: 70 }} />
        </View>

        {matchQuery.isLoading ? (
          <View style={styles.loadingWrap}>
            <View style={styles.skeletonCard}>
              <SkeletonBlock lines={5} gap={14} />
            </View>
          </View>
        ) : matchQuery.isError || !match ? (
          <View style={styles.errorWrap}>
            <Ionicons name="alert-circle-outline" size={40} color={theme.colors.error} />
            <Text style={styles.errorTitle}>Match unavailable</Text>
            <Pressable style={styles.retryBtn} onPress={() => router.back()}>
              <Text style={styles.retryText}>Go Back</Text>
            </Pressable>
          </View>
        ) : (
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* ── Hero: avatar + score ── */}
            <View style={styles.hero}>
              <ProfileAvatar
                initials="M♥"
                size={80}
                tier={match.tier}
              />
              <View style={[styles.scoreCircle, { borderColor: sc }]}>
                <Text style={[styles.scoreNum, { color: sc }]}>{match.score}</Text>
                <Text style={[styles.scorePct, { color: sc }]}>%</Text>
                <Text style={[styles.scoreLabel, { color: sc }]}>match</Text>
              </View>
            </View>

            {/* ── Badges row ── */}
            <View style={styles.badgesRow}>
              <LinearGradient
                colors={tc}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.tierBadge}
              >
                <Ionicons
                  name={match.tier === 'vip' ? 'diamond' : match.tier === 'priority' ? 'flash' : 'star-outline'}
                  size={11}
                  color="#1C102D"
                />
                <Text style={styles.tierBadgeText}>{humanize(match.tier)}</Text>
              </LinearGradient>

              <View style={[styles.statusBadge, { borderColor: `${sm.color}50`, backgroundColor: `${sm.color}18` }]}>
                <Ionicons name={sm.icon} size={11} color={sm.color} />
                <Text style={[styles.statusBadgeText, { color: sm.color }]}>{sm.label}</Text>
              </View>

              {match.userAction !== 'pending' && (
                <View style={styles.actionBadge}>
                  <Ionicons
                    name={match.userAction === 'accepted' ? 'checkmark' : 'close'}
                    size={11}
                    color={match.userAction === 'accepted' ? theme.colors.success : theme.colors.error}
                  />
                  <Text style={[styles.actionBadgeText, {
                    color: match.userAction === 'accepted' ? theme.colors.success : theme.colors.error,
                  }]}>
                    You {match.userAction}
                  </Text>
                </View>
              )}
            </View>

            {/* ── Intro note ── */}
            {match.introductionNote ? (
              <LinearGradient
                colors={['rgba(255,215,0,0.12)', 'rgba(255,215,0,0.05)']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.noteCard}
              >
                <Ionicons name="chatbubble-outline" size={16} color={theme.colors.primary} />
                <Text style={styles.noteText}>{match.introductionNote}</Text>
              </LinearGradient>
            ) : null}

            {/* ── Compatibility breakdown ── */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Compatibility Breakdown</Text>
              <View style={styles.barsWrap}>
                {Object.entries(match.scoreBreakdown)
                  .filter(([k]) => k !== 'total')
                  .map(([key, value]) => {
                    const pct = typeof value === 'number' ? value : 0;
                    const barColor = scoreColor(pct);
                    return (
                      <View key={key} style={styles.barRow}>
                        <Text style={styles.barLabel}>
                          {DIMENSION_LABELS[key] ?? humanize(key)}
                        </Text>
                        <View style={styles.barTrack}>
                          <LinearGradient
                            colors={
                              pct >= 80
                                ? [theme.colors.success, '#3BB89A']
                                : pct >= 60
                                ? ['#FFE680', '#D9A300']
                                : ['#FF8FA3', '#D54B68']
                            }
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={[styles.barFill, { width: `${pct}%` }]}
                          />
                        </View>
                        <Text style={[styles.barPct, { color: barColor }]}>{pct}%</Text>
                      </View>
                    );
                  })}
              </View>
            </View>

            {/* ── Match meta ── */}
            <View style={styles.metaCard}>
              <MetaRow
                label="Their response"
                value={humanize(match.matchedUserAction)}
                highlight={match.matchedUserAction === 'accepted'}
              />
              <MetaRow
                label="Introduced"
                value={new Date(match.createdAt).toLocaleDateString('en-GB', {
                  day: 'numeric', month: 'long', year: 'numeric',
                })}
              />
              <MetaRow
                label="Last updated"
                value={new Date(match.updatedAt).toLocaleDateString('en-GB', {
                  day: 'numeric', month: 'short', year: 'numeric',
                })}
              />
            </View>

            {/* ── Flash message ── */}
            {flashMessage ? (
              <View style={[styles.flash, flashIsError ? styles.flashError : styles.flashSuccess]}>
                <Ionicons
                  name={flashIsError ? 'alert-circle-outline' : 'checkmark-circle-outline'}
                  size={16}
                  color={flashIsError ? theme.colors.error : theme.colors.success}
                />
                <Text style={[styles.flashText, { color: flashIsError ? theme.colors.error : theme.colors.success }]}>
                  {flashMessage}
                </Text>
              </View>
            ) : null}

            {/* ── Actions ── */}
            {!alreadyResponded && match.status !== 'expired' ? (
              <View style={styles.actions}>
                <Pressable
                  style={styles.actionAccept}
                  onPress={() => respondMutation.mutate('accepted')}
                  disabled={respondMutation.isPending}
                >
                  <LinearGradient
                    colors={['#6EDBB0', '#059669']}
                    start={{ x: 0.1, y: 0.1 }}
                    end={{ x: 0.9, y: 0.9 }}
                    style={styles.actionGrad}
                  >
                    <Ionicons name="checkmark-circle" size={20} color="#fff" />
                    <Text style={styles.actionText}>Accept Match</Text>
                  </LinearGradient>
                </Pressable>
                <Pressable
                  style={styles.actionDecline}
                  onPress={() => respondMutation.mutate('declined')}
                  disabled={respondMutation.isPending}
                >
                  <View style={styles.actionDeclineInner}>
                    <Ionicons name="close-circle-outline" size={20} color={theme.colors.error} />
                    <Text style={[styles.actionText, { color: theme.colors.error }]}>Decline</Text>
                  </View>
                </Pressable>
              </View>
            ) : alreadyResponded ? (
              <View style={styles.respondedNote}>
                <Ionicons
                  name={match.userAction === 'accepted' ? 'checkmark-circle' : 'close-circle'}
                  size={18}
                  color={match.userAction === 'accepted' ? theme.colors.success : theme.colors.error}
                />
                <Text style={[styles.respondedText, {
                  color: match.userAction === 'accepted' ? theme.colors.success : theme.colors.error,
                }]}>
                  You {match.userAction} this match
                </Text>
              </View>
            ) : null}
          </ScrollView>
        )}
      </SafeAreaView>
    </LinearGradient>
  );
}

function MetaRow({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <View style={styles.metaRow}>
      <Text style={styles.metaLabel}>{label}</Text>
      <Text style={[styles.metaValue, highlight && styles.metaValueHighlight]}>{value}</Text>
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
    backgroundColor: 'rgba(227,193,111,0.12)',
  },
  glowTop: { top: -130, right: -130 },

  navbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    width: 70,
  },
  backText: {
    fontFamily: theme.font.sans,
    color: theme.colors.primary,
    fontSize: 14,
  },
  navTitle: {
    fontFamily: theme.font.sansBold,
    color: theme.colors.text,
    fontSize: 16,
  },

  loadingWrap: { flex: 1, padding: 20 },
  skeletonCard: {
    padding: 20,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  errorWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 14 },
  errorTitle: { fontFamily: theme.font.sansBold, color: theme.colors.text, fontSize: 16 },
  retryBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: theme.colors.error,
  },
  retryText: { fontFamily: theme.font.sansBold, color: theme.colors.error, fontSize: 13 },

  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 40,
    gap: 16,
  },

  hero: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    paddingHorizontal: 8,
  },
  scoreCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    gap: 0,
  },
  scoreNum: { fontFamily: theme.font.sansBold, fontSize: 34, lineHeight: 36 },
  scorePct: { fontFamily: theme.font.sans, fontSize: 13, lineHeight: 15 },
  scoreLabel: { fontFamily: theme.font.sans, fontSize: 11, lineHeight: 14, opacity: 0.8 },

  badgesRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tierBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  tierBadgeText: { fontFamily: theme.font.sansBold, fontSize: 11, color: '#1C102D' },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
  },
  statusBadgeText: { fontFamily: theme.font.sans, fontSize: 11 },
  actionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  actionBadgeText: { fontFamily: theme.font.sans, fontSize: 11 },

  noteCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,215,0,0.25)',
  },
  noteText: {
    flex: 1,
    fontFamily: theme.font.sans,
    color: theme.colors.text,
    fontSize: 13,
    lineHeight: 19,
    fontStyle: 'italic',
  },

  section: { gap: 14 },
  sectionTitle: {
    fontFamily: theme.font.sansBold,
    color: theme.colors.text,
    fontSize: 15,
    letterSpacing: 0.3,
  },
  barsWrap: { gap: 12 },
  barRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  barLabel: {
    fontFamily: theme.font.sans,
    color: theme.colors.textMuted,
    fontSize: 12,
    width: 100,
  },
  barTrack: {
    flex: 1,
    height: 7,
    backgroundColor: 'rgba(255,255,255,0.10)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  barFill: { height: '100%', borderRadius: 4 },
  barPct: {
    fontFamily: theme.font.sansBold,
    fontSize: 12,
    width: 36,
    textAlign: 'right',
  },

  metaCard: {
    borderRadius: 16,
    padding: 16,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    gap: 12,
  },
  metaRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  metaLabel: { fontFamily: theme.font.sans, color: theme.colors.textMuted, fontSize: 13 },
  metaValue: { fontFamily: theme.font.sans, color: theme.colors.text, fontSize: 13 },
  metaValueHighlight: { fontFamily: theme.font.sansBold, color: theme.colors.success },

  flash: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  flashSuccess: { backgroundColor: theme.colors.successSurface, borderColor: `${theme.colors.success}40` },
  flashError: { backgroundColor: theme.colors.errorSurface, borderColor: `${theme.colors.error}40` },
  flashText: { fontFamily: theme.font.sans, fontSize: 13, flex: 1 },

  actions: { gap: 10 },
  actionAccept: { borderRadius: 16, overflow: 'hidden' },
  actionGrad: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 15,
    borderRadius: 16,
  },
  actionText: { fontFamily: theme.font.sansBold, color: '#fff', fontSize: 15 },
  actionDecline: {
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: `${theme.colors.error}60`,
    overflow: 'hidden',
  },
  actionDeclineInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    backgroundColor: 'rgba(255,143,163,0.07)',
  },

  respondedNote: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 14,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
  },
  respondedText: {
    fontFamily: theme.font.sansBold,
    fontSize: 14,
    textTransform: 'capitalize',
  },
});
