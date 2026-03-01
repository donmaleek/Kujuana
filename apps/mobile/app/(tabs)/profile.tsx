import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { AppScreen } from '@/components/ui/AppScreen';
import { FadeIn } from '@/components/ui/FadeIn';
import { GlassCard } from '@/components/ui/GlassCard';
import { GoldButton } from '@/components/ui/GoldButton';
import { TabScreenHeader } from '@/components/ui/TabScreenHeader';
import { COLORS, FONT, RADIUS } from '@/lib/theme/tokens';
import { useAppData } from '@/lib/state/app-data';
import { useSession } from '@/lib/state/session';

function formatPreferenceLines(preferences: Record<string, unknown> | undefined): string[] {
  if (!preferences) return [];
  return Object.entries(preferences)
    .map(([key, value]) => {
      if (value == null || value === '') return null;
      const label = key
        .replace(/([A-Z])/g, ' $1')
        .replace(/^./, (char) => char.toUpperCase());
      const rendered = Array.isArray(value) ? value.join(', ') : typeof value === 'object' ? JSON.stringify(value) : String(value);
      return `${label}: ${rendered}`;
    })
    .filter((line): line is string => Boolean(line))
    .slice(0, 6);
}

function parseNonNegotiables(input: string): string[] {
  return input
    .split(/\n|,/)
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 10);
}

const BIO_VISION_MIN_LENGTH = 60;

export default function ProfileScreen() {
  const router = useRouter();
  const { user } = useSession();
  const { profile, matches, loading, error, refreshAll, updateProfile } = useAppData();

  const completion = Math.min(100, Math.max(0, Math.round(profile?.completeness ?? 0)));
  const fullName = profile?.fullName || user?.fullName || 'Member';
  const age = profile?.age;
  const city = profile?.location?.label || profile?.location?.city || 'Location pending';
  const tier = (profile?.tier || user?.tier || 'standard').toUpperCase();
  const bio = profile?.bio || profile?.relationshipVision || 'Tell us about your relationship vision to increase compatibility quality.';
  const profileLifeVision = (profile as { lifeVision?: string } | null)?.lifeVision || '';
  const values = (profile?.nonNegotiables ?? []).slice(0, 8);
  const preferences = formatPreferenceLines(profile?.preferences as Record<string, unknown> | undefined);
  const pendingIntros = matches.filter((match) => match.userAction === 'pending').length;
  const acceptedIntros = matches.filter((match) => match.userAction === 'accepted').length;

  const [editFullName, setEditFullName] = useState('');
  const [editOccupation, setEditOccupation] = useState('');
  const [editCity, setEditCity] = useState('');
  const [editCountry, setEditCountry] = useState('');
  const [editBio, setEditBio] = useState('');
  const [editVision, setEditVision] = useState('');
  const [editNonNegotiables, setEditNonNegotiables] = useState('');
  const [saving, setSaving] = useState(false);
  const [savingBioVision, setSavingBioVision] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  const formBusy = saving || savingBioVision;
  const bioLength = editBio.trim().length;
  const visionLength = editVision.trim().length;
  const bioVisionReady = bioLength >= BIO_VISION_MIN_LENGTH && visionLength >= BIO_VISION_MIN_LENGTH;

  useEffect(() => {
    setEditFullName(profile?.fullName || user?.fullName || '');
    setEditOccupation(profile?.occupation || '');
    setEditCity(profile?.location?.city || '');
    setEditCountry(profile?.location?.country || '');
    setEditBio(profile?.bio || '');
    const fallbackVision = profile?.relationshipVision || profileLifeVision || '';
    setEditVision(fallbackVision);
    setEditNonNegotiables((profile?.nonNegotiables || []).join('\n'));
  }, [
    profile?.bio,
    profile?.fullName,
    profile?.location?.city,
    profile?.location?.country,
    profile?.nonNegotiables,
    profile?.occupation,
    profileLifeVision,
    profile?.relationshipVision,
    user?.fullName,
  ]);

  const nextSteps = useMemo(
    () => [
      completion < 100
        ? {
            id: 'complete-profile',
            title: bioVisionReady ? 'Complete your profile details' : 'Complete bio and vision',
            subtitle: bioVisionReady
              ? 'Use the form below to improve your profile completeness score.'
              : `Write at least ${BIO_VISION_MIN_LENGTH} characters in both bio and relationship vision to unlock profile completion.`,
            action: bioVisionReady
              ? `${completion}% done`
              : `${Math.min(bioLength, BIO_VISION_MIN_LENGTH)}/${BIO_VISION_MIN_LENGTH} • ${Math.min(visionLength, BIO_VISION_MIN_LENGTH)}/${BIO_VISION_MIN_LENGTH}`,
            cta: bioVisionReady ? 'Fill details below' : 'Update below',
            onPress: () => {
              if (!bioVisionReady) {
                setFormSuccess(null);
                setFormError(`Bio and relationship vision must each be at least ${BIO_VISION_MIN_LENGTH} characters.`);
              }
            },
          }
        : null,
      pendingIntros > 0
        ? {
            id: 'pending-intros',
            title: `Respond to ${pendingIntros} pending ${pendingIntros === 1 ? 'intro' : 'intros'}`,
            subtitle: 'Quick responses improve your placement in active matching queues.',
            action: 'Today',
            cta: 'Open matches',
            onPress: () => router.push('/(tabs)/matches'),
          }
        : null,
      {
        id: 'plan-review',
        title: 'Review your membership plan',
        subtitle: 'Check credits, renewal timeline, and tier benefits.',
        action: tier,
        cta: 'Manage plan',
        onPress: () => router.push('/(tabs)/subscription'),
      },
    ].filter((step): step is NonNullable<typeof step> => Boolean(step)),
    [bioLength, bioVisionReady, completion, pendingIntros, router, tier, visionLength],
  );

  async function onSaveDetails() {
    const normalizedFullName = editFullName.trim();
    const normalizedOccupation = editOccupation.trim();
    const normalizedCity = editCity.trim();
    const normalizedCountry = editCountry.trim();
    const normalizedBio = editBio.trim();
    const normalizedVision = editVision.trim();
    const nonNegotiables = parseNonNegotiables(editNonNegotiables);

    if (normalizedFullName.length < 2) {
      setFormSuccess(null);
      setFormError('Full name must have at least 2 characters.');
      return;
    }

    if ((normalizedCity && !normalizedCountry) || (!normalizedCity && normalizedCountry)) {
      setFormSuccess(null);
      setFormError('Please provide both city and country, or leave both blank.');
      return;
    }

    setSaving(true);
    setFormError(null);
    setFormSuccess(null);

    try {
      const patch: Record<string, unknown> = {
        fullName: normalizedFullName,
        occupation: normalizedOccupation,
        bio: normalizedBio,
        relationshipVision: normalizedVision,
        nonNegotiables,
      };

      if (normalizedCity && normalizedCountry) {
        patch.location = {
          city: normalizedCity,
          country: normalizedCountry,
          label: `${normalizedCity}, ${normalizedCountry}`,
        };

        patch.basic = {
          city: normalizedCity,
          country: normalizedCountry,
          occupation: normalizedOccupation,
        };
      }

      await updateProfile(patch);
      setFormSuccess('Profile details saved successfully.');
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Unable to save profile details.');
    } finally {
      setSaving(false);
    }
  }

  async function onSaveBioVision() {
    const normalizedBio = editBio.trim();
    const normalizedVision = editVision.trim();

    if (!normalizedBio && !normalizedVision) {
      setFormSuccess(null);
      setFormError('Add a bio or relationship vision before saving.');
      return;
    }

    if (normalizedBio.length < BIO_VISION_MIN_LENGTH || normalizedVision.length < BIO_VISION_MIN_LENGTH) {
      setFormSuccess(null);
      setFormError(`Bio and relationship vision must each be at least ${BIO_VISION_MIN_LENGTH} characters.`);
      return;
    }

    setSavingBioVision(true);
    setFormError(null);
    setFormSuccess(null);

    try {
      await updateProfile({
        bio: normalizedBio,
        relationshipVision: normalizedVision,
      });
      setFormSuccess('Bio and relationship vision saved successfully.');
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Unable to save bio and relationship vision.');
    } finally {
      setSavingBioVision(false);
    }
  }

  return (
    <AppScreen>
      <FadeIn>
        <TabScreenHeader
          title="Profile"
          subtitle="Show who you are, refine your intentions, and increase match quality."
        />
      </FadeIn>

      <FadeIn delay={90}>
        <GlassCard highlighted>
          <View style={styles.heroTop}>
            <View style={styles.avatarBig}>
              <Text style={styles.avatarInitial}>{fullName.slice(0, 1).toUpperCase()}</Text>
            </View>
            <View style={styles.heroMeta}>
              <Text style={styles.name}>{age ? `${fullName}, ${age}` : fullName}</Text>
              <Text style={styles.city}>{city}</Text>
              <View style={styles.tierPill}>
                <MaterialCommunityIcons name="crown" size={12} color={COLORS.goldGlow} />
                <Text style={styles.tierText}>{tier}</Text>
              </View>
            </View>
          </View>

          <View style={styles.heroStats}>
            <Stat label="Profile" value={`${completion}%`} />
            <Stat label="Accepted" value={`${acceptedIntros}`} />
            <Stat label="Credits" value={`${profile?.credits ?? user?.credits ?? 0}`} />
          </View>

          <View style={styles.heroActions}>
            <GoldButton label={loading ? 'Refreshing...' : 'Refresh profile'} onPress={refreshAll} style={styles.heroActionButton} />
            <GoldButton label="Edit settings" outlined onPress={() => router.push('/(tabs)/settings')} style={styles.heroActionButton} />
          </View>

          {loading ? (
            <View style={styles.loadingRow}>
              <ActivityIndicator size="small" color={COLORS.goldGlow} />
              <Text style={styles.loadingText}>Loading profile...</Text>
            </View>
          ) : null}
          {error ? <Text style={styles.errorText}>{error}</Text> : null}
        </GlassCard>
      </FadeIn>

      <FadeIn delay={150}>
        <GlassCard highlighted>
          <Text style={styles.sectionTitle}>Complete profile details</Text>
          <Text style={styles.emptyNote}>Keep your profile current so matching quality keeps improving.</Text>

          <Text style={styles.inputLabel}>Full name</Text>
          <TextInput
            value={editFullName}
            onChangeText={setEditFullName}
            placeholder="Your full name"
            placeholderTextColor="rgba(196,168,130,0.75)"
            style={styles.input}
            editable={!formBusy}
          />

          <Text style={styles.inputLabel}>Occupation</Text>
          <TextInput
            value={editOccupation}
            onChangeText={setEditOccupation}
            placeholder="Occupation"
            placeholderTextColor="rgba(196,168,130,0.75)"
            style={styles.input}
            editable={!formBusy}
          />

          <View style={styles.locationRow}>
            <View style={styles.locationCol}>
              <Text style={styles.inputLabel}>City</Text>
              <TextInput
                value={editCity}
                onChangeText={setEditCity}
                placeholder="Nairobi"
                placeholderTextColor="rgba(196,168,130,0.75)"
                style={styles.input}
                editable={!formBusy}
              />
            </View>
            <View style={styles.locationCol}>
              <Text style={styles.inputLabel}>Country</Text>
              <TextInput
                value={editCountry}
                onChangeText={setEditCountry}
                placeholder="Kenya"
                placeholderTextColor="rgba(196,168,130,0.75)"
                style={styles.input}
                editable={!formBusy}
              />
            </View>
          </View>

          <Text style={styles.inputLabel}>About you</Text>
          <TextInput
            value={editBio}
            onChangeText={setEditBio}
            placeholder="Tell us about yourself"
            placeholderTextColor="rgba(196,168,130,0.75)"
            style={[styles.input, styles.inputMultiline]}
            editable={!formBusy}
            multiline
          />
          <Text style={styles.inputHint}>{`${editBio.trim().length} characters`}</Text>

          <Text style={styles.inputLabel}>Relationship vision</Text>
          <TextInput
            value={editVision}
            onChangeText={setEditVision}
            placeholder="What kind of relationship are you building?"
            placeholderTextColor="rgba(196,168,130,0.75)"
            style={[styles.input, styles.inputMultiline]}
            editable={!formBusy}
            multiline
          />
          <Text style={styles.inputHint}>{`${editVision.trim().length} characters`}</Text>
          <Text style={styles.inputHintStrong}>{`Minimum ${BIO_VISION_MIN_LENGTH} characters each to unlock profile completion`}</Text>

          <View style={styles.formActionRow}>
            <GoldButton
              label={savingBioVision ? 'Saving bio & vision...' : 'Save bio & vision'}
              outlined
              onPress={() => void onSaveBioVision()}
            />
          </View>

          <Text style={styles.inputLabel}>Non-negotiables (one per line)</Text>
          <TextInput
            value={editNonNegotiables}
            onChangeText={setEditNonNegotiables}
            placeholder={'Faith\nKindness\nConsistency'}
            placeholderTextColor="rgba(196,168,130,0.75)"
            style={[styles.input, styles.inputMultiline]}
            editable={!formBusy}
            multiline
          />

          {formError ? <Text style={styles.errorText}>{formError}</Text> : null}
          {formSuccess ? <Text style={styles.successText}>{formSuccess}</Text> : null}

          <View style={styles.formActionRow}>
            <GoldButton label={saving ? 'Saving...' : 'Save profile details'} onPress={() => void onSaveDetails()} />
          </View>
        </GlassCard>
      </FadeIn>

      <FadeIn delay={230}>
        <GlassCard>
          <Text style={styles.sectionTitle}>About</Text>
          <Text style={styles.body}>{bio}</Text>
          {profile?.occupation ? <Text style={styles.metaText}>{`Occupation: ${profile.occupation}`}</Text> : null}
          {profile?.religion ? <Text style={styles.metaText}>{`Faith: ${profile.religion}`}</Text> : null}
        </GlassCard>
      </FadeIn>

      <FadeIn delay={310}>
        <GlassCard>
          <Text style={styles.sectionTitle}>Core values</Text>
          {values.length > 0 ? (
            <View style={styles.tagsRow}>
              {values.map((value) => (
                <Tag key={value} label={value} />
              ))}
            </View>
          ) : (
            <Text style={styles.emptyNote}>Add non-negotiables in your profile to sharpen curation quality.</Text>
          )}
        </GlassCard>
      </FadeIn>

      <FadeIn delay={380}>
        <GlassCard>
          <Text style={styles.sectionTitle}>Preferences</Text>
          {preferences.length > 0 ? (
            <View style={styles.prefList}>
              {preferences.map((item) => (
                <View key={item} style={styles.prefItem}>
                  <MaterialCommunityIcons name="check-circle-outline" size={16} color={COLORS.goldChampagne} />
                  <Text style={styles.prefText}>{item}</Text>
                </View>
              ))}
            </View>
          ) : (
            <Text style={styles.emptyNote}>No preference data yet. Complete onboarding preferences to improve matching.</Text>
          )}
        </GlassCard>
      </FadeIn>

      <FadeIn delay={450}>
        <GlassCard highlighted>
          <Text style={styles.sectionTitle}>Next steps</Text>
          <Text style={styles.emptyNote}>Keep momentum by completing your next high-impact actions.</Text>

          <View style={styles.nextStepsWrap}>
            {nextSteps.map((step) => (
              <View key={step.id} style={styles.nextStepCard}>
                <View style={styles.nextStepHead}>
                  <Text style={styles.nextStepTitle}>{step.title}</Text>
                  <Text style={styles.nextStepAction}>{step.action}</Text>
                </View>
                <Text style={styles.nextStepSubtitle}>{step.subtitle}</Text>
                <Pressable onPress={step.onPress} style={({ pressed }) => [styles.nextStepButton, pressed && styles.nextStepButtonPressed]}>
                  <Text style={styles.nextStepButtonText}>{step.cta}</Text>
                  <MaterialCommunityIcons name="chevron-right" size={16} color={COLORS.goldChampagne} />
                </Pressable>
              </View>
            ))}
          </View>
        </GlassCard>
      </FadeIn>
    </AppScreen>
  );
}

type StatProps = {
  label: string;
  value: string;
};

function Stat({ label, value }: StatProps) {
  return (
    <View style={styles.statItem}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );
}

type TagProps = {
  label: string;
};

function Tag({ label }: TagProps) {
  return (
    <View style={styles.tag}>
      <Text style={styles.tagText}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  heroTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 14,
  },
  avatarBig: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 1,
    borderColor: COLORS.stroke,
    backgroundColor: 'rgba(212,175,55,0.14)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {
    color: COLORS.goldGlow,
    fontFamily: FONT.displayBold,
    fontSize: 30,
  },
  heroMeta: {
    flex: 1,
  },
  name: {
    color: COLORS.offWhite,
    fontFamily: FONT.displayBold,
    fontSize: 28,
    lineHeight: 31,
  },
  city: {
    marginTop: -1,
    color: COLORS.textMuted,
    fontFamily: FONT.body,
    fontSize: 13,
  },
  tierPill: {
    marginTop: 8,
    alignSelf: 'flex-start',
    borderRadius: RADIUS.pill,
    borderWidth: 1,
    borderColor: COLORS.stroke,
    backgroundColor: 'rgba(212,175,55,0.14)',
    paddingHorizontal: 9,
    paddingVertical: 5,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  tierText: {
    color: COLORS.goldGlow,
    fontFamily: FONT.bodyMedium,
    fontSize: 11,
    letterSpacing: 0.8,
  },
  heroStats: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  heroActions: {
    flexDirection: 'row',
    gap: 10,
  },
  heroActionButton: {
    flex: 1,
  },
  statItem: {
    flex: 1,
    borderWidth: 1,
    borderColor: COLORS.strokeSoft,
    borderRadius: RADIUS.md,
    backgroundColor: 'rgba(255,255,255,0.03)',
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  statLabel: {
    color: COLORS.textMuted,
    fontFamily: FONT.body,
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.7,
  },
  statValue: {
    color: COLORS.offWhite,
    fontFamily: FONT.bodySemiBold,
    fontSize: 13,
    marginTop: 4,
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
  successText: {
    marginTop: 8,
    color: COLORS.success,
    fontFamily: FONT.body,
    fontSize: 12,
  },
  sectionTitle: {
    color: COLORS.offWhite,
    fontFamily: FONT.display,
    fontSize: 24,
    marginBottom: 6,
  },
  inputLabel: {
    marginTop: 10,
    color: COLORS.goldChampagne,
    fontFamily: FONT.bodyMedium,
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.7,
  },
  input: {
    marginTop: 6,
    borderWidth: 1,
    borderColor: COLORS.strokeSoft,
    borderRadius: RADIUS.md,
    backgroundColor: 'rgba(255,255,255,0.04)',
    color: COLORS.offWhite,
    fontFamily: FONT.body,
    fontSize: 14,
    paddingHorizontal: 12,
    paddingVertical: 11,
  },
  inputMultiline: {
    minHeight: 90,
    textAlignVertical: 'top',
  },
  inputHint: {
    marginTop: 4,
    color: COLORS.textMuted,
    fontFamily: FONT.body,
    fontSize: 11,
  },
  inputHintStrong: {
    marginTop: 2,
    color: COLORS.goldChampagne,
    fontFamily: FONT.bodyMedium,
    fontSize: 11,
  },
  locationRow: {
    flexDirection: 'row',
    gap: 8,
  },
  locationCol: {
    flex: 1,
  },
  formActionRow: {
    marginTop: 12,
  },
  body: {
    color: COLORS.textBody,
    fontFamily: FONT.body,
    fontSize: 14,
    lineHeight: 20,
  },
  metaText: {
    marginTop: 6,
    color: COLORS.textMuted,
    fontFamily: FONT.body,
    fontSize: 13,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  tag: {
    borderRadius: RADIUS.pill,
    borderWidth: 1,
    borderColor: COLORS.strokeSoft,
    backgroundColor: 'rgba(255,255,255,0.03)',
    paddingHorizontal: 11,
    paddingVertical: 6,
  },
  tagText: {
    color: COLORS.goldChampagne,
    fontFamily: FONT.bodyMedium,
    fontSize: 12,
  },
  prefList: {
    gap: 9,
    marginTop: 2,
  },
  prefItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  prefText: {
    color: COLORS.textBody,
    fontFamily: FONT.body,
    fontSize: 14,
    flex: 1,
  },
  emptyNote: {
    color: COLORS.textMuted,
    fontFamily: FONT.body,
    fontSize: 13,
    lineHeight: 18,
  },
  nextStepsWrap: {
    marginTop: 12,
    gap: 10,
  },
  nextStepCard: {
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.strokeSoft,
    backgroundColor: 'rgba(255,255,255,0.03)',
    padding: 12,
  },
  nextStepHead: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 10,
  },
  nextStepTitle: {
    flex: 1,
    color: COLORS.offWhite,
    fontFamily: FONT.bodySemiBold,
    fontSize: 14,
    lineHeight: 18,
  },
  nextStepAction: {
    color: COLORS.goldGlow,
    fontFamily: FONT.bodyMedium,
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.7,
  },
  nextStepSubtitle: {
    marginTop: 4,
    color: COLORS.textMuted,
    fontFamily: FONT.body,
    fontSize: 12,
    lineHeight: 17,
  },
  nextStepButton: {
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
  nextStepButtonPressed: {
    opacity: 0.86,
  },
  nextStepButtonText: {
    color: COLORS.goldChampagne,
    fontFamily: FONT.bodySemiBold,
    fontSize: 12,
  },
});
