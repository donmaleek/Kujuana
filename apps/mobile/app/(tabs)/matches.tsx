import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { AppScreen } from '@/components/ui/AppScreen';
import { FadeIn } from '@/components/ui/FadeIn';
import { GlassCard } from '@/components/ui/GlassCard';
import { GoldButton } from '@/components/ui/GoldButton';
import { TabScreenHeader } from '@/components/ui/TabScreenHeader';
import { COLORS, FONT, RADIUS } from '@/lib/theme/tokens';
import { useAppData } from '@/lib/state/app-data';

function matchLabel(action: string | undefined): string {
  if (action === 'accepted') return 'Accepted';
  if (action === 'declined') return 'Declined';
  return 'Pending';
}

function tierLabel(tier: string): string {
  if (tier === 'vip') return 'VIP';
  if (tier === 'priority') return 'Priority';
  return 'Standard';
}

export default function MatchesScreen() {
  const { matches, loading, refreshing, error, refreshAll, respondToMatch } = useAppData();

  return (
    <AppScreen>
      <FadeIn>
        <TabScreenHeader
          title="Curated Matches"
          subtitle="Review every intro, see compatibility signals, and respond instantly."
        />
      </FadeIn>

      <FadeIn delay={110}>
        <View style={styles.topActions}>
          <GoldButton label={refreshing ? 'Refreshing...' : 'Refresh'} onPress={refreshAll} style={styles.topAction} />
          <GoldButton label={`${matches.length} total`} outlined style={styles.topAction} />
        </View>
        {loading ? (
          <View style={styles.loadingWrap}>
            <ActivityIndicator size="small" color={COLORS.goldGlow} />
            <Text style={styles.loadingText}>Loading your intros...</Text>
          </View>
        ) : null}
        {error ? <Text style={styles.errorText}>{error}</Text> : null}
      </FadeIn>

      {matches.length === 0 && !loading ? (
        <FadeIn delay={180}>
          <GlassCard>
            <Text style={styles.emptyTitle}>No matches yet</Text>
            <Text style={styles.emptyBody}>Complete your onboarding and keep your profile active to receive curated intros.</Text>
          </GlassCard>
        </FadeIn>
      ) : null}

      {matches.map((match, index) => {
        const name = match.other?.fullName || match.other?.firstName || 'Match';
        const age = match.other?.age;
        const location = match.other?.location ?? 'Location pending';
        const score = Math.round(match.compatibilityScore ?? match.score ?? 0);
        const action = match.userAction;
        const statusText = matchLabel(action);

        return (
          <FadeIn key={match.id} delay={200 + index * 70}>
            <GlassCard style={styles.matchCard} highlighted={score >= 90}>
              <View style={styles.matchHeader}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{name.slice(0, 1).toUpperCase()}</Text>
                </View>
                <View style={styles.matchMeta}>
                  <Text style={styles.name}>{age ? `${name}, ${age}` : name}</Text>
                  <Text style={styles.city}>{location}</Text>
                </View>
                <View style={styles.scoreWrap}>
                  <Text style={styles.scoreValue}>{score}%</Text>
                  <Text style={styles.scoreLabel}>fit</Text>
                </View>
              </View>

              <View style={styles.metaRow}>
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{tierLabel(match.tier)}</Text>
                </View>
                <View style={[styles.badge, action === 'accepted' ? styles.badgeSuccess : action === 'declined' ? styles.badgeDanger : null]}>
                  <Text style={styles.badgeText}>{statusText}</Text>
                </View>
              </View>

              <Text style={styles.bio}>{match.other?.bio || 'Compatibility profile available once both members accept the introduction.'}</Text>

              <View style={styles.matchActions}>
                <GoldButton
                  label={action === 'declined' ? 'Declined' : 'Decline'}
                  style={styles.action}
                  outlined
                  onPress={action === 'declined' ? undefined : () => respondToMatch(match.id, 'declined')}
                />
                <GoldButton
                  label={action === 'accepted' ? 'Accepted' : 'Accept'}
                  style={styles.action}
                  onPress={action === 'accepted' ? undefined : () => respondToMatch(match.id, 'accepted')}
                />
              </View>
            </GlassCard>
          </FadeIn>
        );
      })}
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  topActions: {
    flexDirection: 'row',
    gap: 8,
  },
  topAction: {
    flex: 1,
  },
  loadingWrap: {
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
    marginTop: 6,
    color: COLORS.danger,
    fontFamily: FONT.body,
    fontSize: 12,
  },
  emptyTitle: {
    color: COLORS.offWhite,
    fontFamily: FONT.bodySemiBold,
    fontSize: 17,
  },
  emptyBody: {
    marginTop: 4,
    color: COLORS.textMuted,
    fontFamily: FONT.body,
    fontSize: 13,
    lineHeight: 19,
  },
  matchCard: {
    gap: 12,
  },
  matchHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    borderWidth: 1,
    borderColor: COLORS.stroke,
    backgroundColor: 'rgba(212,175,55,0.14)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: COLORS.goldGlow,
    fontFamily: FONT.displayBold,
    fontSize: 22,
  },
  matchMeta: {
    flex: 1,
  },
  name: {
    color: COLORS.offWhite,
    fontFamily: FONT.bodySemiBold,
    fontSize: 17,
  },
  city: {
    color: COLORS.textMuted,
    fontFamily: FONT.body,
    fontSize: 13,
  },
  scoreWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 44,
  },
  scoreValue: {
    color: COLORS.goldGlow,
    fontFamily: FONT.bodySemiBold,
    fontSize: 18,
  },
  scoreLabel: {
    color: COLORS.textMuted,
    fontFamily: FONT.bodyMedium,
    textTransform: 'uppercase',
    fontSize: 10,
    letterSpacing: 0.6,
    marginTop: -2,
  },
  metaRow: {
    flexDirection: 'row',
    gap: 8,
  },
  badge: {
    borderRadius: RADIUS.pill,
    borderWidth: 1,
    borderColor: COLORS.strokeSoft,
    paddingHorizontal: 9,
    paddingVertical: 5,
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  badgeSuccess: {
    borderColor: 'rgba(103,217,143,0.5)',
    backgroundColor: 'rgba(103,217,143,0.14)',
  },
  badgeDanger: {
    borderColor: 'rgba(240,130,130,0.5)',
    backgroundColor: 'rgba(240,130,130,0.14)',
  },
  badgeText: {
    color: COLORS.goldChampagne,
    fontFamily: FONT.bodyMedium,
    fontSize: 11,
  },
  bio: {
    color: COLORS.textBody,
    fontFamily: FONT.body,
    fontSize: 13,
    lineHeight: 19,
  },
  matchActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 2,
  },
  action: {
    flex: 1,
  },
});
