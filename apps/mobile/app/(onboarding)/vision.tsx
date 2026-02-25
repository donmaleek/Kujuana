import { useMemo, useState } from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import {
  CommunicationStyle,
  ConflictResolutionStyle,
  CoreValue,
  EmotionalReadiness,
  MarriageTimeline,
  PolygamyStance,
  RelationshipType,
} from '@kujuana/shared';
import { ApiError } from '@/lib/api/types';
import { saveOnboardingStep } from '@/lib/api/endpoints';
import { refreshProfile } from '@/lib/auth/bootstrap';
import { DeviceShell } from '@/components/common/DeviceShell';

const GOLD = '#FFD700';

const RELATIONSHIP_TYPES = [
  'Long-term commitment',
  'Marriage',
  'Casual dating',
  'Friendship first',
];

const PARTNER_VALUES = [
  'Honesty',
  'Ambition',
  'Kindness',
  'Family-oriented',
  'Spirituality',
];

const CORE_VALUE_MAP: Record<string, CoreValue> = {
  Honesty: CoreValue.Simplicity,
  Ambition: CoreValue.Career,
  Kindness: CoreValue.Service,
  'Family-oriented': CoreValue.Family,
  Spirituality: CoreValue.Faith,
};

export default function RelationshipVisionStepScreen() {
  const [types, setTypes] = useState<string[]>(['Long-term commitment', 'Marriage']);
  const [values, setValues] = useState<string[]>(['Honesty', 'Kindness', 'Family-oriented']);
  const [idealPartner, setIdealPartner] = useState('');
  const [lifeVision, setLifeVision] = useState('');
  const [nonNegotiables, setNonNegotiables] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const canContinue = useMemo(() => {
    return (
      types.length > 0 &&
      values.length > 0 &&
      idealPartner.trim().length >= 10 &&
      lifeVision.trim().length >= 6 &&
      nonNegotiables.trim().length >= 6
    );
  }, [types, values, idealPartner, lifeVision, nonNegotiables]);

  const toggle = (arr: string[], item: string) =>
    arr.includes(item) ? arr.filter((x) => x !== item) : [...arr, item];

  async function continueToNext() {
    if (!canContinue || saving) return;

    if (idealPartner.trim().length < 50) {
      setError('Ideal partner description must be at least 50 characters.');
      return;
    }

    if (lifeVision.trim().length < 50) {
      setError('Life vision must be at least 50 characters.');
      return;
    }

    const mappedCoreValues = values
      .map((value) => CORE_VALUE_MAP[value])
      .filter(Boolean)
      .slice(0, 5);

    const nonNegotiableList = nonNegotiables
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean)
      .slice(0, 10);

    setError('');
    setSaving(true);

    try {
      await saveOnboardingStep(5, {
        relationshipType: types.includes('Marriage')
          ? RelationshipType.Marriage
          : RelationshipType.SeriesCommitment,
        marriageTimeline: types.includes('Marriage')
          ? MarriageTimeline.Within1Year
          : MarriageTimeline.Within2Years,
        polygamyStance: PolygamyStance.Closed,
        coreValues: mappedCoreValues.length ? mappedCoreValues : [CoreValue.Family],
        idealPartnerDescription: idealPartner.trim(),
        lifeVision: lifeVision.trim(),
        nonNegotiables: nonNegotiableList.length ? nonNegotiableList : [nonNegotiables.trim()],
        emotionalReadiness: EmotionalReadiness.Ready,
        communicationStyle: CommunicationStyle.Direct,
        conflictResolution: ConflictResolutionStyle.TalkItOut,
      });

      await refreshProfile();
      router.push('/(onboarding)/preferences');
    } catch (err) {
      if (err instanceof ApiError || err instanceof Error) {
        setError(err.message);
      } else {
        setError('Unable to save this step right now.');
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <LinearGradient
      colors={['#140321', '#2A0B46', '#4B165E', '#2A0B46', '#140321']}
      start={{ x: 0.12, y: 0.08 }}
      end={{ x: 0.9, y: 0.98 }}
      style={styles.bg}
    >
      <View style={[styles.cornerArt, styles.cornerTopRight]} />
      <View style={[styles.cornerArt, styles.cornerBottomLeft]} />
      <View style={[styles.glow, styles.glowTop]} />
      <View style={[styles.glow, styles.glowBottom]} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <DeviceShell>
          <ScrollView contentContainerStyle={styles.container} bounces={false}>
          <View style={styles.brandRow}>
            <Image source={require('../../assets/kujuana_logo.png')} style={styles.brandLogo} resizeMode="contain" />
            <Text style={styles.brandText}>KUJUANA</Text>
          </View>

          <View style={styles.stepPillOuter}>
            <LinearGradient
              colors={['#FFE680', '#FFD700', '#D9A300']}
              start={{ x: 0.1, y: 0.2 }}
              end={{ x: 0.9, y: 0.8 }}
              style={styles.stepPill}
            >
              <Text style={styles.stepText}>Step 3 of 5</Text>
            </LinearGradient>
          </View>

          <Text style={styles.title}>Relationship vision</Text>

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <View style={styles.panelOuter}>
            <LinearGradient
              colors={['rgba(255,255,255,0.14)', 'rgba(255,255,255,0.06)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.panel}
            >
              <SectionHeader
                icon="hand-left-outline"
                title="Type of relationship wanted"
              />
              <ChipRow
                options={RELATIONSHIP_TYPES}
                selected={types}
                onToggle={(item) => setTypes((p) => toggle(p, item))}
              />

              <View style={{ marginTop: 18 }}>
                <SectionHeader icon="people-outline" title="Partner values" />
                <ChipRow
                  options={PARTNER_VALUES}
                  selected={values}
                  onToggle={(item) => setValues((p) => toggle(p, item))}
                />
              </View>

              <View style={{ marginTop: 18 }}>
                <SectionHeader icon="person-outline" title="Ideal partner description" />
                <GoldTextArea
                  placeholder="Describe your ideal partner's personality, interests, and qualities..."
                  value={idealPartner}
                  onChangeText={setIdealPartner}
                  minHeight={92}
                />
              </View>

              <View style={{ marginTop: 18 }}>
                <SectionHeader icon="earth-outline" title="Life vision sentence" />
                <GoldTextArea
                  placeholder="Summarize your shared future vision..."
                  value={lifeVision}
                  onChangeText={setLifeVision}
                  minHeight={62}
                />
              </View>

              <View style={{ marginTop: 18 }}>
                <SectionHeader icon="clipboard-outline" title="Non-negotiables" />
                <GoldTextArea
                  placeholder="List absolute deal-breakers..."
                  value={nonNegotiables}
                  onChangeText={setNonNegotiables}
                  minHeight={62}
                />
              </View>
            </LinearGradient>
          </View>

          <Pressable
            style={{ marginTop: 18, width: '100%' }}
            onPress={continueToNext}
            disabled={!canContinue || saving}
          >
            <LinearGradient
              colors={['#FFE680', '#FFD700', '#D9A300']}
              start={{ x: 0.1, y: 0.2 }}
              end={{ x: 0.9, y: 0.8 }}
              style={[styles.continueBtn, (!canContinue || saving) && { opacity: 0.55 }]}
            >
              <Text style={styles.continueText}>{saving ? 'Saving...' : 'Continue'}</Text>
            </LinearGradient>
          </Pressable>
          </ScrollView>
        </DeviceShell>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

function SectionHeader({ icon, title }: { icon: keyof typeof Ionicons.glyphMap; title: string }) {
  return (
    <View style={styles.sectionHeader}>
      <View style={styles.sectionIcon}>
        <Ionicons name={icon} size={18} color={GOLD} />
      </View>
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
  );
}

function ChipRow({
  options,
  selected,
  onToggle,
}: {
  options: string[];
  selected: string[];
  onToggle: (item: string) => void;
}) {
  return (
    <View style={styles.chipsWrap}>
      {options.map((item) => {
        const active = selected.includes(item);
        return (
          <Pressable key={item} onPress={() => onToggle(item)}>
            <View style={[styles.chipOuter, active && styles.chipOuterActive]}>
              <LinearGradient
                colors={
                  active
                    ? ['rgba(230,196,106,0.92)', 'rgba(230,196,106,0.30)']
                    : ['rgba(230,196,106,0.35)', 'rgba(230,196,106,0.10)']
                }
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.chipBorder}
              >
                <View style={[styles.chipInner, active && styles.chipInnerActive]}>
                  <Text style={[styles.chipText, active && { color: '#1C0C2A' }]}>
                    {item}
                  </Text>
                </View>
              </LinearGradient>
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}

function GoldTextArea({
  placeholder,
  value,
  onChangeText,
  minHeight,
}: {
  placeholder: string;
  value: string;
  onChangeText: (t: string) => void;
  minHeight: number;
}) {
  return (
    <View style={styles.textAreaOuter}>
      <LinearGradient
        colors={['rgba(230,196,106,0.55)', 'rgba(230,196,106,0.18)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.textAreaBorder}
      >
        <View style={[styles.textAreaInner, { minHeight }]}>
          <TextInput
            placeholder={placeholder}
            placeholderTextColor="rgba(255,255,255,0.55)"
            value={value}
            onChangeText={onChangeText}
            multiline
            style={styles.textAreaInput}
          />
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1 },
  container: {
    flexGrow: 1,
    paddingTop: 16,
    paddingHorizontal: 16,
    paddingBottom: 22,
  },
  error: {
    color: '#f3b0b0',
    textAlign: 'center',
    marginTop: 10,
    fontSize: 12,
  },
  glow: {
    position: 'absolute',
    width: 280,
    height: 280,
    borderRadius: 280,
    backgroundColor: 'rgba(233,197,108,0.16)',
    opacity: 0.9,
  },
  glowTop: { top: -90, right: -120 },
  glowBottom: { bottom: -150, left: -140, opacity: 0.55 },
  cornerArt: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderWidth: 1,
    borderColor: 'rgba(230,196,106,0.16)',
    borderRadius: 28,
    transform: [{ rotate: '14deg' }],
  },
  cornerTopRight: { top: -40, right: -60 },
  cornerBottomLeft: { bottom: -60, left: -60, transform: [{ rotate: '-12deg' }] },
  brandRow: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  brandLogo: {
    width: 104,
    height: 104,
    shadowColor: 'rgba(255, 215, 0, 0.9)',
    shadowOpacity: 0.55,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 0 },
  },
  brandText: {
    color: GOLD,
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: 2,
    textShadowColor: 'rgba(255, 215, 0, 0.65)',
    textShadowRadius: 10,
  },
  stepPillOuter: {
    alignItems: 'center',
    marginTop: 14,
  },
  stepPill: {
    paddingHorizontal: 26,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepText: {
    color: '#1C0C2A',
    fontSize: 14,
    fontWeight: '900',
  },
  title: {
    marginTop: 16,
    textAlign: 'center',
    color: GOLD,
    fontSize: 40,
    fontWeight: '900',
    lineHeight: 46,
    textShadowColor: 'rgba(255, 215, 0, 0.6)',
    textShadowRadius: 12,
  },
  panelOuter: {
    marginTop: 16,
    borderRadius: 22,
    padding: 1.2,
    borderWidth: 1,
    borderColor: 'rgba(230,196,106,0.22)',
    backgroundColor: 'rgba(255,255,255,0.02)',
  },
  panel: {
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 18,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  sectionIcon: {
    width: 28,
    height: 28,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.18)',
    borderWidth: 1,
    borderColor: 'rgba(230,196,106,0.35)',
  },
  sectionTitle: {
    color: GOLD,
    fontSize: 18,
    fontWeight: '900',
  },
  chipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  chipOuter: { borderRadius: 16, overflow: 'hidden' },
  chipOuterActive: {
    shadowColor: GOLD,
    shadowOpacity: Platform.OS === 'ios' ? 0.25 : 0.8,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  chipBorder: { borderRadius: 16, padding: 1.2 },
  chipInner: {
    borderRadius: 15,
    paddingHorizontal: 14,
    height: 36,
    backgroundColor: 'rgba(0,0,0,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipInnerActive: {
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  chipText: {
    color: 'rgba(255,255,255,0.86)',
    fontSize: 13.5,
    fontWeight: '800',
  },
  textAreaOuter: { marginTop: 8 },
  textAreaBorder: { borderRadius: 16, padding: 1.2 },
  textAreaInner: {
    borderRadius: 15,
    backgroundColor: 'rgba(0,0,0,0.16)',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  textAreaInput: {
    color: 'rgba(255,255,255,0.90)',
    fontSize: 13.5,
    lineHeight: 18,
  },
  continueBtn: {
    height: 58,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  continueText: {
    color: '#1C0C2A',
    fontSize: 18,
    fontWeight: '900',
  },
});
