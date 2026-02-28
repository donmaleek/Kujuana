import { useState } from 'react';
import { Image, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '@/store/auth-store';
import { refreshProfile } from '@/lib/auth/bootstrap';
import { type ProfileMe } from '@/lib/api/types';
import { humanize } from '@/lib/utils/format';
import { theme } from '@/lib/config/theme';

type SectionKey = 'identity' | 'lifestyle' | 'vision' | 'preferences';

const SECTION_LABELS: Record<SectionKey, { label: string; icon: keyof typeof Ionicons.glyphMap }> = {
  identity: { label: 'Identity', icon: 'person-outline' },
  lifestyle: { label: 'Lifestyle', icon: 'leaf-outline' },
  vision: { label: 'Vision', icon: 'heart-outline' },
  preferences: { label: 'Preferences', icon: 'options-outline' },
};

function completenessColor(pct: number) {
  if (pct >= 80) return theme.colors.success;
  if (pct >= 50) return theme.colors.primary;
  return theme.colors.error;
}

function tierColors(tier: string): [string, string] {
  if (tier === 'vip') return ['#FFE680', '#D9A300'];
  if (tier === 'priority') return ['#C084FC', '#7C3AED'];
  return ['#6EDBB0', '#059669'];
}

export default function ProfileTabScreen() {
  const profile = useAuthStore((state) => state.profile);
  const profileLoading = useAuthStore((state) => state.profileLoading);
  const completeness = profile?.completeness?.overall ?? 0;
  const tier = 'standard';
  const [activeSection, setActiveSection] = useState<SectionKey>('identity');
  const [refreshing, setRefreshing] = useState(false);

  const primaryPhoto = profile?.photos?.find((p) => p.isPrimary) ?? profile?.photos?.[0];

  async function handleRefresh() {
    setRefreshing(true);
    try {
      await refreshProfile();
    } finally {
      setRefreshing(false);
    }
  }

  return (
    <LinearGradient
      colors={[theme.colors.canvasDeep, theme.colors.canvas, '#25103C', theme.colors.canvasStrong, theme.colors.canvasDeep]}
      style={styles.flex}
    >
      <View style={[styles.glow, styles.glowTopRight]} />
      <SafeAreaView style={styles.flex}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing || profileLoading}
              onRefresh={handleRefresh}
              tintColor={theme.colors.primary}
              colors={[theme.colors.primary]}
            />
          }
        >
          {/* ── Profile hero ── */}
          <LinearGradient
            colors={['rgba(255,255,255,0.10)', 'rgba(255,255,255,0.04)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.heroCard}
          >
            {/* Photo + completeness ring */}
            <View style={styles.avatarWrap}>
              <LinearGradient
                colors={['rgba(255,215,0,0.7)', 'rgba(125,87,201,0.7)']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.avatarRing}
              >
                {primaryPhoto?.url ? (
                  <Image
                    source={{ uri: primaryPhoto.url }}
                    style={styles.avatarImage}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={styles.avatarPlaceholder}>
                    <Ionicons name="person" size={38} color={theme.colors.primary} />
                  </View>
                )}
              </LinearGradient>

              {/* Completeness badge */}
              <View style={[styles.completeBadge, { borderColor: completenessColor(completeness) }]}>
                <Text style={[styles.completePct, { color: completenessColor(completeness) }]}>
                  {completeness}%
                </Text>
              </View>
            </View>

            {/* Name / location */}
            <View style={styles.heroInfo}>
              <View style={styles.heroNameRow}>
                <Text style={styles.heroLocation}>
                  {[profile?.basic?.city, profile?.basic?.country].filter(Boolean).join(', ') || 'Location not set'}
                </Text>
                <LinearGradient
                  colors={tierColors(tier)}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.tierPill}
                >
                  <Ionicons
                    name={tier === 'vip' ? 'diamond' : tier === 'priority' ? 'flash' : 'star-outline'}
                    size={10}
                    color="#1C102D"
                  />
                  <Text style={styles.tierPillText}>{tier.toUpperCase()}</Text>
                </LinearGradient>
              </View>
              <Text style={styles.heroOccupation}>
                {(profile?.basic?.occupation as string | undefined) || 'Occupation not set'}
              </Text>
            </View>

            {/* Progress bar */}
            <View style={styles.progressSection}>
              <View style={styles.progressHeaderRow}>
                <Text style={styles.progressLabel}>Profile completeness</Text>
                <Text style={[styles.progressPct, { color: completenessColor(completeness) }]}>
                  {completeness}%
                </Text>
              </View>
              <View style={styles.progressTrack}>
                <LinearGradient
                  colors={
                    completeness >= 80
                      ? [theme.colors.success, '#3BB89A']
                      : completeness >= 50
                      ? ['#FFE680', '#D9A300']
                      : ['#FF8FA3', '#D54B68']
                  }
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.progressFill, { width: `${completeness}%` }]}
                />
              </View>
            </View>

            {/* Completeness checklist */}
            <View style={styles.checkRow}>
              <CheckItem label="Basic" done={!!profile?.completeness?.basic} />
              <CheckItem label="Photos" done={!!profile?.completeness?.photos} />
              <CheckItem label="Vision" done={!!profile?.completeness?.vision} />
              <CheckItem label="Prefs" done={!!profile?.completeness?.preferences} />
            </View>
          </LinearGradient>

          {/* ── Photo grid ── */}
          {profile?.photos && profile.photos.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Photos ({profile.photos.length} / 3)</Text>
              <View style={styles.photoGrid}>
                {profile.photos
                  .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
                  .map((photo) => (
                    <View key={photo.publicId} style={styles.photoSlot}>
                      {photo.url ? (
                        <Image
                          source={{ uri: photo.url }}
                          style={styles.photoImage}
                          resizeMode="cover"
                        />
                      ) : (
                        <View style={styles.photoPlaceholder}>
                          <Ionicons name="image-outline" size={24} color={theme.colors.textMuted} />
                        </View>
                      )}
                      {photo.isPrimary && (
                        <View style={styles.primaryBadge}>
                          <Text style={styles.primaryBadgeText}>Primary</Text>
                        </View>
                      )}
                    </View>
                  ))}
              </View>
            </View>
          )}

          {/* ── Section tabs ── */}
          <View style={styles.section}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsRow}>
              {(Object.keys(SECTION_LABELS) as SectionKey[]).map((key) => {
                const { label, icon } = SECTION_LABELS[key];
                const isActive = activeSection === key;
                return (
                  <Pressable
                    key={key}
                    style={[styles.tab, isActive && styles.tabActive]}
                    onPress={() => setActiveSection(key)}
                  >
                    {isActive ? (
                      <LinearGradient
                        colors={['rgba(255,215,0,0.20)', 'rgba(255,215,0,0.08)']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.tabGrad}
                      >
                        <Ionicons name={icon} size={14} color={theme.colors.primary} />
                        <Text style={styles.tabTextActive}>{label}</Text>
                      </LinearGradient>
                    ) : (
                      <View style={styles.tabInactive}>
                        <Ionicons name={icon} size={14} color={theme.colors.textMuted} />
                        <Text style={styles.tabText}>{label}</Text>
                      </View>
                    )}
                  </Pressable>
                );
              })}
            </ScrollView>

            {/* Section content */}
            <View style={styles.sectionContent}>
              {profileQuery.isLoading ? (
                <SkeletonBlock lines={4} gap={12} />
              ) : (
                <SectionContent profile={profile} section={activeSection} />
              )}
            </View>
          </View>

          {/* ── Status card ── */}
          <LinearGradient
            colors={
              profile?.isSubmitted
                ? ['rgba(110,219,176,0.15)', 'rgba(110,219,176,0.06)']
                : ['rgba(255,215,0,0.12)', 'rgba(255,215,0,0.04)']
            }
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.statusCard}
          >
            <Ionicons
              name={profile?.isSubmitted ? 'checkmark-circle' : 'time-outline'}
              size={20}
              color={profile?.isSubmitted ? theme.colors.success : theme.colors.primary}
            />
            <View style={{ flex: 1 }}>
              <Text style={styles.statusTitle}>
                {profile?.isSubmitted ? 'Profile submitted' : 'Not yet submitted'}
              </Text>
              <Text style={styles.statusBody}>
                {profile?.isSubmitted
                  ? 'Your profile is live and matches are being curated.'
                  : 'Complete all sections to activate precision matching.'}
              </Text>
            </View>
          </LinearGradient>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

function CheckItem({ label, done }: { label: string; done: boolean }) {
  return (
    <View style={styles.checkItem}>
      <Ionicons
        name={done ? 'checkmark-circle' : 'ellipse-outline'}
        size={14}
        color={done ? theme.colors.success : theme.colors.textMuted}
      />
      <Text style={[styles.checkLabel, { color: done ? theme.colors.success : theme.colors.textMuted }]}>
        {label}
      </Text>
    </View>
  );
}

function SectionContent({
  profile,
  section,
}: {
  profile: ProfileMe | null | undefined;
  section: SectionKey;
}) {
  if (!profile) {
    return <Text style={styles.emptyText}>No data available.</Text>;
  }

  if (section === 'identity') {
    return (
      <View style={styles.dataRows}>
        <DataRow label="Gender" value={humanize(String(profile.basic?.gender ?? ''))} />
        <DataRow label="Country" value={String(profile.basic?.country ?? 'Not set')} />
        <DataRow label="City" value={String(profile.basic?.city ?? 'Not set')} />
        <DataRow label="Religion" value={humanize(String(profile.basic?.religion ?? ''))} />
        <DataRow label="Marital Status" value={humanize(String(profile.basic?.maritalStatus ?? ''))} />
        <DataRow label="Occupation" value={String(profile.basic?.occupation ?? 'Not set')} />
      </View>
    );
  }

  if (section === 'lifestyle') {
    const bg = profile.background as Record<string, unknown> | undefined;
    return (
      <View style={styles.dataRows}>
        <DataRow label="Smoking" value={humanize(String(bg?.smokingHabit ?? ''))} />
        <DataRow label="Drinking" value={humanize(String(bg?.drinkingHabit ?? ''))} />
        <DataRow label="Diet" value={humanize(String(bg?.dietType ?? ''))} />
        <DataRow label="Exercise" value={humanize(String(bg?.exerciseFrequency ?? ''))} />
        <DataRow label="Children" value={humanize(String(bg?.childrenStatus ?? ''))} />
        <DataRow label="Wants children" value={humanize(String(bg?.wantsChildren ?? ''))} />
        {Array.isArray(bg?.personalityTraits) && (bg.personalityTraits as string[]).length > 0 && (
          <DataRow
            label="Personality"
            value={(bg.personalityTraits as string[]).map(humanize).join(', ')}
          />
        )}
      </View>
    );
  }

  if (section === 'vision') {
    const v = profile.vision as Record<string, unknown> | undefined;
    return (
      <View style={styles.dataRows}>
        <DataRow
          label="Seeking"
          value={
            Array.isArray(v?.relationshipType)
              ? (v.relationshipType as string[]).map(humanize).join(', ')
              : humanize(String(v?.relationshipType ?? ''))
          }
        />
        <DataRow
          label="Core values"
          value={
            Array.isArray(v?.coreValues)
              ? (v.coreValues as string[]).map(humanize).join(', ')
              : 'Not set'
          }
        />
        {v?.idealPartnerDescription ? (
          <View style={styles.textBlock}>
            <Text style={styles.textBlockLabel}>Ideal partner</Text>
            <Text style={styles.textBlockBody}>{String(v.idealPartnerDescription)}</Text>
          </View>
        ) : null}
        {v?.lifeVision ? (
          <View style={styles.textBlock}>
            <Text style={styles.textBlockLabel}>Life vision</Text>
            <Text style={styles.textBlockBody}>{String(v.lifeVision)}</Text>
          </View>
        ) : null}
      </View>
    );
  }

  if (section === 'preferences') {
    const p = profile.preferences as Record<string, unknown> | undefined;
    return (
      <View style={styles.dataRows}>
        {p?.ageRange && typeof p.ageRange === 'object' ? (
          <DataRow
            label="Age range"
            value={`${(p.ageRange as { min: number; max: number }).min} – ${(p.ageRange as { min: number; max: number }).max} yrs`}
          />
        ) : null}
        <DataRow
          label="Countries"
          value={Array.isArray(p?.countries) ? (p.countries as string[]).join(', ') : 'Any'}
        />
        <DataRow label="Religion" value={humanize(String(p?.religion ?? 'Any'))} />
        <DataRow
          label="International"
          value={(p as any)?.internationalSearch ? 'Open to international matches' : 'Local only'}
        />
      </View>
    );
  }

  return null;
}

function DataRow({ label, value }: { label: string; value: string }) {
  if (!value || value === 'undefined' || value === '') return null;
  return (
    <View style={styles.dataRow}>
      <Text style={styles.dataLabel}>{label}</Text>
      <Text style={styles.dataValue}>{value || '—'}</Text>
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
    backgroundColor: 'rgba(227,193,111,0.12)',
  },
  glowTopRight: { top: -120, right: -130 },

  scroll: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 40, gap: 16 },

  heroCard: {
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,215,0,0.20)',
    gap: 14,
  },
  avatarWrap: { alignSelf: 'center', position: 'relative', marginTop: 4 },
  avatarRing: {
    width: 96,
    height: 96,
    borderRadius: 48,
    padding: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarImage: { width: 90, height: 90, borderRadius: 45 },
  avatarPlaceholder: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: theme.colors.canvasStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  completeBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.colors.canvasStrong,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  completePct: { fontFamily: theme.font.sansBold, fontSize: 10 },

  heroInfo: { alignItems: 'center', gap: 4 },
  heroNameRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  heroLocation: { fontFamily: theme.font.sansBold, color: theme.colors.text, fontSize: 15 },
  tierPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  tierPillText: { fontFamily: theme.font.sansBold, fontSize: 9, color: '#1C102D' },
  heroOccupation: { fontFamily: theme.font.sans, color: theme.colors.textMuted, fontSize: 13 },

  progressSection: { gap: 6 },
  progressHeaderRow: { flexDirection: 'row', justifyContent: 'space-between' },
  progressLabel: { fontFamily: theme.font.sans, color: theme.colors.textMuted, fontSize: 12 },
  progressPct: { fontFamily: theme.font.sansBold, fontSize: 12 },
  progressTrack: {
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.10)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: { height: '100%', borderRadius: 3 },

  checkRow: { flexDirection: 'row', justifyContent: 'space-between' },
  checkItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  checkLabel: { fontFamily: theme.font.sans, fontSize: 11 },

  section: { gap: 12 },
  sectionTitle: {
    fontFamily: theme.font.sansBold,
    color: theme.colors.text,
    fontSize: 15,
    letterSpacing: 0.3,
  },

  photoGrid: { flexDirection: 'row', gap: 10 },
  photoSlot: {
    flex: 1,
    aspectRatio: 0.8,
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,215,0,0.20)',
    position: 'relative',
  },
  photoImage: { width: '100%', height: '100%' },
  photoPlaceholder: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  primaryBadge: {
    position: 'absolute',
    bottom: 6,
    left: 6,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 8,
    backgroundColor: 'rgba(255,215,0,0.85)',
  },
  primaryBadgeText: { fontFamily: theme.font.sansBold, fontSize: 9, color: '#1C102D' },

  tabsRow: { gap: 8, flexDirection: 'row' },
  tab: { borderRadius: 14, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.10)' },
  tabActive: { borderColor: 'rgba(255,215,0,0.35)' },
  tabGrad: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 14, paddingVertical: 8 },
  tabInactive: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 14, paddingVertical: 8 },
  tabText: { fontFamily: theme.font.sans, color: theme.colors.textMuted, fontSize: 12 },
  tabTextActive: { fontFamily: theme.font.sansBold, color: theme.colors.primary, fontSize: 12 },

  sectionContent: {
    padding: 16,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },

  dataRows: { gap: 12 },
  dataRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  dataLabel: { fontFamily: theme.font.sans, color: theme.colors.textMuted, fontSize: 13, flex: 1 },
  dataValue: { fontFamily: theme.font.sans, color: theme.colors.text, fontSize: 13, flex: 1.5, textAlign: 'right' },

  textBlock: { gap: 4 },
  textBlockLabel: {
    fontFamily: theme.font.sansBold,
    color: theme.colors.textMuted,
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  textBlockBody: {
    fontFamily: theme.font.sans,
    color: theme.colors.text,
    fontSize: 13,
    lineHeight: 19,
    fontStyle: 'italic',
  },

  emptyText: { fontFamily: theme.font.sans, color: theme.colors.textMuted, fontSize: 13 },

  statusCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
  },
  statusTitle: { fontFamily: theme.font.sansBold, color: theme.colors.text, fontSize: 13 },
  statusBody: { fontFamily: theme.font.sans, color: theme.colors.textMuted, fontSize: 12, lineHeight: 17, marginTop: 2 },
});
