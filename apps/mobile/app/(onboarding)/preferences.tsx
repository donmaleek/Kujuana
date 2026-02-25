import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import {
  Image,
  PanResponder,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { ApiError } from '@/lib/api/types';
import { saveOnboardingStep } from '@/lib/api/endpoints';
import { refreshProfile } from '@/lib/auth/bootstrap';
import { DeviceShell } from '@/components/common/DeviceShell';

const GOLD = '#FFD700';

const COUNTRY_OPTIONS = ['Kenya', 'Tanzania', 'Uganda', 'United States', 'United Kingdom'];
const LIFESTYLE_OPTIONS = [
  'Lifestyle compatibility',
  'Family-centered',
  'Faith-centered',
  'Career-focused',
  'Balanced active lifestyle',
];
const RELIGION_OPTIONS = ['Religious preference', 'Islam', 'Christianity', 'Other'];

export default function MatchingPreferencesStepScreen() {
  const [minAge, setMinAge] = useState(20);
  const [maxAge, setMaxAge] = useState(45);

  const [countries, setCountries] = useState('Countries / regions');
  const [lifestyle, setLifestyle] = useState('Lifestyle compatibility');
  const [religion, setReligion] = useState('Religious preference');
  const [international, setInternational] = useState(false);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const canContinue = useMemo(
    () => minAge < maxAge && minAge >= 18,
    [minAge, maxAge],
  );

  async function continueToNext() {
    if (!canContinue || saving) return;

    setError('');
    setSaving(true);

    const selectedCountry = countries === 'Countries / regions' ? 'Kenya' : countries;
    const selectedLifestyle = lifestyle === 'Lifestyle compatibility' ? 'Family-centered' : lifestyle;
    const selectedReligion = religion === 'Religious preference' ? 'Islam' : religion;

    try {
      await saveOnboardingStep(6, {
        ageRange: {
          min: Math.max(minAge, 18),
          max: Math.max(maxAge, Math.max(minAge, 18) + 1),
        },
        countries: [selectedCountry],
        religions: [selectedReligion],
        maritalStatuses: ['single'],
        openToInternational: international,
        lifestylePreferences: [selectedLifestyle],
      });

      await refreshProfile();
      router.push('/(onboarding)/photos');
    } catch (err) {
      if (err instanceof ApiError || err instanceof Error) {
        setError(err.message);
      } else {
        setError('Unable to save matching preferences right now.');
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
      <View style={[styles.glow, styles.glowTop]} />
      <View style={[styles.glow, styles.glowBottom]} />

      <DeviceShell>
        <View style={styles.container}>
          <View style={styles.topCardOuter}>
            <LinearGradient
              colors={['rgba(255,255,255,0.14)', 'rgba(255,255,255,0.06)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.topCard}
            >
              <Image
                source={require('../../assets/kujuana_logo.png')}
                style={styles.logoImage}
                resizeMode="contain"
              />
              <Text style={styles.brand}>KUJUANA</Text>
              <Text style={styles.stepText}>Step 4 of 5</Text>
            </LinearGradient>
          </View>

          <GoldBar title="Matching preferences" />

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <GoldPanel>
          <Text style={styles.panelTitle}>Age range</Text>

          <DualKnobSlider
            min={0}
            max={60}
            leftValue={minAge}
            rightValue={maxAge}
            onChange={(l, r) => {
              setMinAge(l);
              setMaxAge(r);
            }}
          />

          <View style={styles.ageLabelsRow}>
            <Text style={styles.ageLabel}>0</Text>
            <Text style={styles.ageLabel}>{minAge}</Text>
            <Text style={styles.ageLabel}>{maxAge}</Text>
            <Text style={styles.ageLabel}>60</Text>
          </View>
          </GoldPanel>

          <Pressable
            onPress={() => setCountries((prev) => cycleOption(prev, COUNTRY_OPTIONS, 'Countries / regions'))}
            style={{ width: '100%' }}
          >
          <GoldRow
            leftIcon="globe-outline"
            label={countries}
            rightIcon={null}
          />
          </Pressable>

          <Pressable
            onPress={() => setLifestyle((prev) => cycleOption(prev, LIFESTYLE_OPTIONS, 'Lifestyle compatibility'))}
            style={{ width: '100%' }}
          >
          <GoldRow leftIcon={null} label={lifestyle} rightIcon="chevron-down" />
          </Pressable>

          <Pressable
            onPress={() => setReligion((prev) => cycleOption(prev, RELIGION_OPTIONS, 'Religious preference'))}
            style={{ width: '100%' }}
          >
          <GoldRow leftIcon={null} label={religion} rightIcon="chevron-down" />
          </Pressable>

          <GoldRow
            leftIcon={null}
            label="International search"
            rightIcon={null}
            rightNode={<GoldToggle value={international} onChange={setInternational} />}
          />

          <Pressable
            style={{ width: '100%', marginTop: 16 }}
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
        </View>
      </DeviceShell>
    </LinearGradient>
  );
}

function GoldBar({ title }: { title: string }) {
  return (
    <View style={styles.headerOuter}>
      <LinearGradient
        colors={['rgba(255,255,255,0.14)', 'rgba(255,255,255,0.06)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerInner}
      >
        <Text style={styles.headerTitle}>{title}</Text>
      </LinearGradient>
    </View>
  );
}

function GoldPanel({ children }: { children: ReactNode }) {
  return (
    <View style={styles.panelOuter}>
      <LinearGradient
        colors={['rgba(230,196,106,0.55)', 'rgba(230,196,106,0.18)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.panelBorder}
      >
        <LinearGradient
          colors={['rgba(255,255,255,0.10)', 'rgba(255,255,255,0.04)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.panelInner}
        >
          <View style={styles.gloss} />
          {children}
        </LinearGradient>
      </LinearGradient>
    </View>
  );
}

function GoldRow({
  leftIcon,
  label,
  rightIcon,
  rightNode,
}: {
  leftIcon: keyof typeof Ionicons.glyphMap | null;
  label: string;
  rightIcon?: keyof typeof Ionicons.glyphMap | null;
  rightNode?: ReactNode;
}) {
  return (
    <View style={styles.rowOuter}>
      <LinearGradient
        colors={['rgba(230,196,106,0.55)', 'rgba(230,196,106,0.18)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.rowBorder}
      >
        <View style={styles.rowInner}>
          <View style={styles.rowLeft}>
            {leftIcon ? (
              <Ionicons name={leftIcon} size={20} color={GOLD} />
            ) : null}
            <Text style={styles.rowText}>{label}</Text>
          </View>

          {rightNode ? (
            rightNode
          ) : rightIcon ? (
            <Ionicons
              name={rightIcon}
              size={22}
              color="rgba(255,255,255,0.60)"
            />
          ) : null}
        </View>
      </LinearGradient>
    </View>
  );
}

function GoldToggle({
  value,
  onChange,
}: {
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <Pressable onPress={() => onChange(!value)} hitSlop={10}>
      <View style={[styles.toggleTrack, value && styles.toggleTrackOn]}>
        <View
          style={[
            styles.toggleKnob,
            value ? styles.toggleKnobOn : styles.toggleKnobOff,
          ]}
        />
      </View>
    </Pressable>
  );
}

function DualKnobSlider({
  min,
  max,
  leftValue,
  rightValue,
  onChange,
}: {
  min: number;
  max: number;
  leftValue: number;
  rightValue: number;
  onChange: (l: number, r: number) => void;
}) {
  const trackWidth = 260;
  const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
  const valueToX = (v: number) => ((v - min) / (max - min)) * trackWidth;
  const xToValue = (x: number) => Math.round(min + (x / trackWidth) * (max - min));

  const leftX = useRef(valueToX(leftValue));
  const rightX = useRef(valueToX(rightValue));

  useEffect(() => {
    leftX.current = valueToX(leftValue);
    rightX.current = valueToX(rightValue);
  }, [leftValue, rightValue]);

  const panLeft = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: () => true,
        onPanResponderMove: (_, g) => {
          const next = clamp(leftX.current + g.dx, 0, rightX.current - 18);
          const v = xToValue(next);
          onChange(v, rightValue);
        },
        onPanResponderRelease: (_, g) => {
          leftX.current = clamp(leftX.current + g.dx, 0, rightX.current - 18);
        },
      }),
    [rightValue],
  );

  const panRight = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: () => true,
        onPanResponderMove: (_, g) => {
          const next = clamp(rightX.current + g.dx, leftX.current + 18, trackWidth);
          const v = xToValue(next);
          onChange(leftValue, v);
        },
        onPanResponderRelease: (_, g) => {
          rightX.current = clamp(rightX.current + g.dx, leftX.current + 18, trackWidth);
        },
      }),
    [leftValue],
  );

  const lx = valueToX(leftValue);
  const rx = valueToX(rightValue);

  return (
    <View style={{ marginTop: 10, alignItems: 'center' }}>
      <View style={[styles.sliderTrack, { width: trackWidth }]}>
        <View style={styles.sliderLine} />

        <LinearGradient
          colors={['#FFE680', '#FFD700', '#D9A300']}
          start={{ x: 0.1, y: 0.2 }}
          end={{ x: 0.9, y: 0.8 }}
          style={[
            styles.sliderFill,
            { left: lx, width: Math.max(8, rx - lx) },
          ]}
        />

        <View
          {...panLeft.panHandlers}
          style={[styles.sliderKnobWrap, { left: lx - 14 }]}
        >
          <LinearGradient
            colors={['#FFE680', '#FFD700', '#D9A300']}
            start={{ x: 0.1, y: 0.2 }}
            end={{ x: 0.9, y: 0.8 }}
            style={styles.sliderKnob}
          />
        </View>

        <View
          {...panRight.panHandlers}
          style={[styles.sliderKnobWrap, { left: rx - 14 }]}
        >
          <LinearGradient
            colors={['#FFE680', '#FFD700', '#D9A300']}
            start={{ x: 0.1, y: 0.2 }}
            end={{ x: 0.9, y: 0.8 }}
            style={styles.sliderKnob}
          />
        </View>
      </View>
    </View>
  );
}

function cycleOption(current: string, options: string[], placeholder: string): string {
  const normalized = current === placeholder ? options[0] : current;
  const index = options.indexOf(normalized);
  if (index === -1) return options[0] ?? current;
  return options[(index + 1) % options.length] ?? current;
}

const styles = StyleSheet.create({
  bg: { flex: 1 },
  container: {
    flex: 1,
    paddingTop: 16,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  error: {
    marginTop: 10,
    color: '#f3b0b0',
    fontSize: 12,
    textAlign: 'center',
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
  topCardOuter: {
    width: 260,
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(230,196,106,0.22)',
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  topCard: {
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 14,
  },
  logoImage: {
    width: 108,
    height: 108,
    marginBottom: 10,
    borderRadius: 24,
    shadowColor: 'rgba(255, 215, 0, 0.9)',
    shadowOpacity: 0.55,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 0 },
  },
  brand: {
    color: GOLD,
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: 2,
    textShadowColor: 'rgba(255, 215, 0, 0.65)',
    textShadowRadius: 10,
  },
  stepText: { marginTop: 8, color: 'rgba(255,255,255,0.78)', fontWeight: '800' },
  headerOuter: {
    marginTop: 18,
    width: '100%',
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(230,196,106,0.30)',
  },
  headerInner: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  headerTitle: {
    color: GOLD,
    fontSize: 36,
    fontWeight: '900',
    textAlign: 'center',
    textShadowColor: 'rgba(255, 215, 0, 0.6)',
    textShadowRadius: 12,
  },
  panelOuter: {
    width: '100%',
    marginTop: 16,
    borderRadius: 18,
    overflow: 'hidden',
  },
  panelBorder: { borderRadius: 18, padding: 1.4 },
  panelInner: {
    borderRadius: 17,
    paddingHorizontal: 14,
    paddingTop: 14,
    paddingBottom: 12,
    backgroundColor: 'rgba(0,0,0,0.16)',
    position: 'relative',
    overflow: 'hidden',
  },
  gloss: {
    position: 'absolute',
    top: -30,
    left: -30,
    width: 140,
    height: 220,
    backgroundColor: 'rgba(255,255,255,0.10)',
    transform: [{ rotate: '18deg' }],
  },
  panelTitle: { color: GOLD, fontSize: 18, fontWeight: '900' },
  sliderTrack: {
    height: 44,
    justifyContent: 'center',
    position: 'relative',
  },
  sliderLine: {
    height: 6,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderWidth: 1,
    borderColor: 'rgba(230,196,106,0.22)',
  },
  sliderFill: {
    position: 'absolute',
    height: 6,
    borderRadius: 999,
    top: 19,
  },
  sliderKnobWrap: {
    position: 'absolute',
    top: 8,
    width: 28,
    height: 28,
    borderRadius: 28,
  },
  sliderKnob: {
    width: 28,
    height: 28,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.25)',
  },
  ageLabelsRow: {
    marginTop: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  ageLabel: { width: '25%', textAlign: 'center', color: 'rgba(255,255,255,0.75)', fontWeight: '800' },
  rowOuter: {
    width: '100%',
    marginTop: 14,
    borderRadius: 18,
    overflow: 'hidden',
  },
  rowBorder: { borderRadius: 18, padding: 1.4 },
  rowInner: {
    borderRadius: 17,
    height: 64,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(0,0,0,0.16)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rowLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  rowText: { color: GOLD, fontSize: 18, fontWeight: '900' },
  toggleTrack: {
    width: 66,
    height: 34,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderWidth: 1,
    borderColor: 'rgba(230,196,106,0.30)',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  toggleTrackOn: {
    backgroundColor: 'rgba(230,196,106,0.16)',
    borderColor: 'rgba(230,196,106,0.55)',
  },
  toggleKnob: {
    width: 28,
    height: 28,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.25)',
    backgroundColor: GOLD,
  },
  toggleKnobOff: { alignSelf: 'flex-start' },
  toggleKnobOn: { alignSelf: 'flex-end' },
  continueBtn: {
    height: 70,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    shadowColor: GOLD,
    shadowOpacity: Platform.OS === 'ios' ? 0.25 : 0.8,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8,
  },
  continueText: { color: '#1C0C2A', fontSize: 22, fontWeight: '900' },
});
