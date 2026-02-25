import { useMemo, useState } from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import type { Step2Input } from '@kujuana/shared';
import { ApiError } from '@/lib/api/types';
import { saveOnboardingStep } from '@/lib/api/endpoints';
import { refreshProfile } from '@/lib/auth/bootstrap';
import { useAuthStore } from '@/store/auth-store';
import { DeviceShell } from '@/components/common/DeviceShell';

type Gender = 'Male' | 'Female' | 'Other';
type RelationshipStatus = 'Single' | 'Divorced' | 'Widowed';

const GOLD = '#FFD700';

export default function BasicDetailsStepScreen() {
  const profile = useAuthStore((state) => state.profile);
  const basic = useMemo(() => profile?.basic ?? {}, [profile]);

  const [gender, setGender] = useState<Gender>(
    basic.gender === 'female' ? 'Female' : basic.gender === 'male' ? 'Male' : 'Male',
  );
  const [age, setAge] = useState(getInitialAge(basic.dateOfBirth));
  const [location, setLocation] = useState(getInitialLocation(basic.city, basic.country));
  const [status, setStatus] = useState<RelationshipStatus>(
    basic.maritalStatus === 'divorced'
      ? 'Divorced'
      : basic.maritalStatus === 'widowed'
        ? 'Widowed'
        : 'Single',
  );
  const [occupation, setOccupation] = useState(typeof basic.occupation === 'string' ? basic.occupation : '');
  const [openStatus, setOpenStatus] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const canContinue = useMemo(() => {
    const a = Number(age);
    return (
      gender.length > 0 &&
      a >= 18 &&
      a <= 99 &&
      location.trim().length >= 2 &&
      occupation.trim().length >= 2
    );
  }, [gender, age, location, occupation]);

  async function continueToNext() {
    if (!canContinue || saving) return;

    const parsedLocation = parseLocation(location);
    if (!parsedLocation.city || !parsedLocation.country) {
      setError('Use location format: City, Country');
      return;
    }

    setError('');
    setSaving(true);

    const input: Step2Input = {
      gender: gender === 'Female' ? 'female' : 'male',
      dateOfBirth: ageToDateOfBirthIso(Number(age)),
      country: parsedLocation.country,
      city: parsedLocation.city,
      maritalStatus: status.toLowerCase() as Step2Input['maritalStatus'],
      occupation: occupation.trim(),
      educationLevel: typeof basic.educationLevel === 'string' && basic.educationLevel.trim().length > 0
        ? basic.educationLevel
        : 'Bachelor Degree',
      religion: typeof basic.religion === 'string' && basic.religion.trim().length > 0
        ? basic.religion
        : 'Islam',
      sect: typeof basic.sect === 'string' && basic.sect.trim().length > 0 ? basic.sect : undefined,
    };

    try {
      await saveOnboardingStep(2, input);
      await refreshProfile();
      router.push('/(onboarding)/background');
    } catch (err) {
      if (err instanceof ApiError || err instanceof Error) {
        setError(err.message);
      } else {
        setError('Unable to save basic details right now.');
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

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <DeviceShell>
          <View style={styles.container}>
            <View style={styles.logoWrap}>
              <Image source={require('../../assets/kujuana_logo.png')} style={styles.logoImage} resizeMode="contain" />
              <Text style={styles.brand}>KUJUANA</Text>
            </View>

            <View style={styles.progressOuter}>
              <View style={styles.progressTrack}>
                <LinearGradient
                  colors={['#FFE680', '#FFD700', '#D9A300']}
                  start={{ x: 0.1, y: 0.2 }}
                  end={{ x: 0.9, y: 0.8 }}
                  style={styles.progressFill}
                />
              </View>
            </View>

            <Text style={styles.step}>Step 1 of 5</Text>
            <Text style={styles.title}>Basic details</Text>

            {error ? <Text style={styles.error}>{error}</Text> : null}

            <View style={styles.cardOuter}>
              <LinearGradient
                colors={['rgba(255,255,255,0.14)', 'rgba(255,255,255,0.06)']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.card}
              >
            <View style={styles.sectionRow}>
              <View style={styles.leftIcon}>
                <Ionicons name="male-female-outline" size={18} color={GOLD} />
              </View>

              <View style={{ flex: 1 }}>
                <Text style={styles.sectionTitle}>Gender selection</Text>

                <View style={styles.genderGrid}>
                  <Radio label="Male" active={gender === 'Male'} onPress={() => setGender('Male')} />
                  <Radio label="Other" active={gender === 'Other'} onPress={() => setGender('Other')} />
                  <Radio label="Female" active={gender === 'Female'} onPress={() => setGender('Female')} />
                </View>
              </View>
            </View>

            <FieldRow
              icon="calendar-outline"
              placeholder="Age"
              value={age}
              onChangeText={(t: string) => setAge(t.replace(/[^0-9]/g, ''))}
              keyboardType="number-pad"
            />

            <FieldRow
              icon="location-outline"
              placeholder="Location (City, Country)"
              value={location}
              onChangeText={setLocation}
            />

            <View style={{ marginTop: 14 }}>
              <View style={styles.sectionRow}>
                <View style={styles.leftIcon}>
                  <Ionicons name="heart-dislike-outline" size={18} color={GOLD} />
                </View>

                <View style={{ flex: 1 }}>
                  <Text style={styles.sectionTitle}>Relationship status</Text>

                  <Pressable
                    onPress={() => setOpenStatus((s) => !s)}
                    style={styles.dropdownOuter}
                  >
                    <LinearGradient
                      colors={['rgba(230,196,106,0.55)', 'rgba(230,196,106,0.18)']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.dropdownBorder}
                    >
                      <View style={styles.dropdownInner}>
                        <Text style={styles.dropdownText}>{status}</Text>
                        <Ionicons
                          name={openStatus ? 'chevron-up' : 'chevron-down'}
                          size={18}
                          color="rgba(255,255,255,0.70)"
                        />
                      </View>
                    </LinearGradient>
                  </Pressable>

                  {openStatus ? (
                    <View style={styles.dropdownMenu}>
                      {(['Single', 'Divorced', 'Widowed'] as RelationshipStatus[]).map((s) => (
                        <Pressable
                          key={s}
                          onPress={() => {
                            setStatus(s);
                            setOpenStatus(false);
                          }}
                          style={styles.menuItem}
                        >
                          <Text style={styles.menuText}>{s}</Text>
                        </Pressable>
                      ))}
                    </View>
                  ) : null}
                </View>
              </View>
            </View>

            <View style={{ marginTop: 12 }}>
              <Text style={[styles.sectionTitle, { marginBottom: 8, marginLeft: 36 }]}>Occupation</Text>

              <FieldRow
                icon="briefcase-outline"
                placeholder="Occupation"
                value={occupation}
                onChangeText={setOccupation}
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

            <Text style={styles.confidential}>All information is confidential</Text>
          </View>
        </DeviceShell>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

function Radio({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={styles.radio}>
      <View style={[styles.radioDotOuter, active && styles.radioDotOuterActive]}>
        {active ? <View style={styles.radioDotInner} /> : null}
      </View>
      <Text style={styles.radioText}>{label}</Text>
    </Pressable>
  );
}

function FieldRow({
  icon,
  placeholder,
  value,
  onChangeText,
  keyboardType,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  placeholder: string;
  value: string;
  onChangeText: (t: string) => void;
  keyboardType?: 'default' | 'email-address' | 'number-pad' | 'phone-pad';
}) {
  return (
    <View style={[styles.sectionRow, { marginTop: 14 }]}>
      <View style={styles.leftIcon}>
        <Ionicons name={icon} size={18} color={GOLD} />
      </View>

      <View style={{ flex: 1 }}>
        <View style={styles.inputOuter}>
          <LinearGradient
            colors={['rgba(230,196,106,0.55)', 'rgba(230,196,106,0.18)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.inputBorder}
          >
            <View style={styles.inputInner}>
              <TextInput
                placeholder={placeholder}
                placeholderTextColor="rgba(255,255,255,0.55)"
                value={value}
                onChangeText={onChangeText}
                keyboardType={keyboardType}
                style={styles.input}
              />
            </View>
          </LinearGradient>
        </View>
      </View>
    </View>
  );
}

function getInitialAge(dateOfBirth: unknown): string {
  if (typeof dateOfBirth !== 'string') return '';
  const date = new Date(dateOfBirth);
  if (Number.isNaN(date.getTime())) return '';

  const now = new Date();
  let years = now.getUTCFullYear() - date.getUTCFullYear();
  const monthDiff = now.getUTCMonth() - date.getUTCMonth();
  const dayDiff = now.getUTCDate() - date.getUTCDate();
  if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) years -= 1;

  return years > 0 ? String(years) : '';
}

function getInitialLocation(city: unknown, country: unknown): string {
  const c = typeof city === 'string' ? city.trim() : '';
  const k = typeof country === 'string' ? country.trim() : '';
  if (c && k) return `${c}, ${k}`;
  if (c) return c;
  return '';
}

function parseLocation(input: string): { city: string; country: string } {
  const parts = input
    .split(',')
    .map((p) => p.trim())
    .filter(Boolean);

  if (parts.length >= 2) {
    const [city, ...rest] = parts;
    return { city: city ?? '', country: rest.join(', ') };
  }

  const single = parts[0] ?? '';
  return { city: single, country: '' };
}

function ageToDateOfBirthIso(age: number): string {
  const now = new Date();
  const dob = new Date(Date.UTC(now.getUTCFullYear() - age, now.getUTCMonth(), now.getUTCDate()));
  return dob.toISOString();
}

const styles = StyleSheet.create({
  bg: { flex: 1 },
  container: {
    flex: 1,
    paddingTop: 26,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  error: {
    color: '#f3b0b0',
    marginTop: 10,
    textAlign: 'center',
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
  logoWrap: { alignItems: 'center' },
  logoImage: {
    width: 108,
    height: 108,
    marginBottom: 12,
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
  progressOuter: {
    marginTop: 18,
    width: '90%',
  },
  progressTrack: {
    height: 10,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.10)',
    borderWidth: 1,
    borderColor: 'rgba(230,196,106,0.22)',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    width: '18%',
    borderRadius: 999,
  },
  step: {
    marginTop: 10,
    color: 'rgba(255,255,255,0.72)',
    fontSize: 15,
    fontWeight: '700',
  },
  title: {
    marginTop: 14,
    color: GOLD,
    fontSize: 42,
    fontWeight: '900',
    textAlign: 'center',
    textShadowColor: 'rgba(255, 215, 0, 0.6)',
    textShadowRadius: 12,
  },
  cardOuter: {
    marginTop: 16,
    width: '100%',
    borderRadius: 22,
    padding: 1.2,
    borderWidth: 1,
    borderColor: 'rgba(230,196,106,0.22)',
    backgroundColor: 'rgba(255,255,255,0.02)',
  },
  card: {
    borderRadius: 22,
    paddingHorizontal: 14,
    paddingTop: 16,
    paddingBottom: 16,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  sectionRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  leftIcon: {
    width: 28,
    height: 28,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.18)',
    borderWidth: 1,
    borderColor: 'rgba(230,196,106,0.35)',
    marginTop: 2,
  },
  sectionTitle: {
    color: GOLD,
    fontSize: 16,
    fontWeight: '900',
    marginBottom: 10,
  },
  genderGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 18,
    marginTop: 2,
  },
  radio: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  radioDotOuter: {
    width: 18,
    height: 18,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.40)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioDotOuterActive: {
    borderColor: GOLD,
    backgroundColor: 'rgba(230,196,106,0.10)',
  },
  radioDotInner: {
    width: 9,
    height: 9,
    borderRadius: 9,
    backgroundColor: GOLD,
  },
  radioText: { color: 'rgba(255,255,255,0.85)', fontWeight: '700' },
  inputOuter: {},
  inputBorder: { borderRadius: 16, padding: 1.2 },
  inputInner: {
    borderRadius: 15,
    backgroundColor: 'rgba(0,0,0,0.16)',
    height: 44,
    paddingHorizontal: 12,
    justifyContent: 'center',
  },
  input: { color: 'rgba(255,255,255,0.90)', fontSize: 14 },
  dropdownOuter: { marginTop: 0 },
  dropdownBorder: { borderRadius: 16, padding: 1.2 },
  dropdownInner: {
    borderRadius: 15,
    backgroundColor: 'rgba(0,0,0,0.16)',
    height: 44,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dropdownText: { color: 'rgba(255,255,255,0.90)', fontSize: 14, fontWeight: '700' },
  dropdownMenu: {
    marginTop: 8,
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(230,196,106,0.22)',
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  menuItem: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  menuText: { color: 'rgba(255,255,255,0.90)', fontWeight: '800' },
  continueBtn: {
    height: 58,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    shadowColor: GOLD,
    shadowOpacity: Platform.OS === 'ios' ? 0.25 : 0.8,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8,
  },
  continueText: { color: '#1C0C2A', fontSize: 18, fontWeight: '900' },
  confidential: {
    marginTop: 14,
    color: 'rgba(255,255,255,0.60)',
    fontSize: 12.5,
    textAlign: 'center',
  },
});
