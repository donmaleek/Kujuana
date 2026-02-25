import { useMemo, useState } from 'react';
import { Image, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import {
  ChildrenStatus,
  DietType,
  DrinkingHabit,
  ExerciseFrequency,
  PersonalityTrait,
  RelocationWillingness,
  SmokingHabit,
  WantsChildren,
} from '@kujuana/shared';
import { ApiError } from '@/lib/api/types';
import { saveOnboardingStep } from '@/lib/api/endpoints';
import { refreshProfile } from '@/lib/auth/bootstrap';
import { DeviceShell } from '@/components/common/DeviceShell';

type TileKey =
  | 'lifestyle'
  | 'personality'
  | 'childrenStatus'
  | 'futureChildren'
  | 'emotionalReadiness';

export default function BackgroundLifestyleStepScreen() {
  const [selected, setSelected] = useState<Record<TileKey, boolean>>({
    lifestyle: true,
    personality: true,
    childrenStatus: false,
    futureChildren: false,
    emotionalReadiness: false,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const canContinue = useMemo(
    () => Object.values(selected).some(Boolean),
    [selected],
  );

  const toggle = (k: TileKey) =>
    setSelected((p) => ({ ...p, [k]: !p[k] }));

  async function continueToNext() {
    if (!canContinue) return;

    setError('');
    setSaving(true);

    const personalityTraits = selected.personality
      ? [PersonalityTrait.Empathetic, PersonalityTrait.Analytical]
      : selected.lifestyle
        ? [PersonalityTrait.Adventurous]
        : selected.emotionalReadiness
          ? [PersonalityTrait.Spiritual]
          : [PersonalityTrait.Ambivert];

    try {
      await saveOnboardingStep(3, {
        smoking: selected.lifestyle ? SmokingHabit.Socially : SmokingHabit.Never,
        drinking: selected.lifestyle ? DrinkingHabit.Socially : DrinkingHabit.Never,
        diet: DietType.Halal,
        exercise: selected.lifestyle ? ExerciseFrequency.Weekly : ExerciseFrequency.Occasionally,
        childrenStatus: selected.childrenStatus
          ? ChildrenStatus.HaveAndWantMore
          : ChildrenStatus.DoNotHave,
        wantsChildren: selected.futureChildren ? WantsChildren.Yes : WantsChildren.OpenTo,
        relocationWillingness: selected.lifestyle
          ? RelocationWillingness.Negotiable
          : RelocationWillingness.No,
        personalityTraits,
        languages: ['English', ...(selected.lifestyle ? ['Kiswahili'] : [])],
      });

      await refreshProfile();
      router.push('/(onboarding)/vision');
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
      start={{ x: 0.15, y: 0.08 }}
      end={{ x: 0.9, y: 0.98 }}
      style={styles.bg}
    >
      <View style={[styles.cornerArt, styles.cornerTopRight]} />
      <View style={[styles.cornerArt, styles.cornerBottomLeft]} />

      <View style={[styles.glow, styles.glowTop]} />
      <View style={[styles.glow, styles.glowMid]} />
      <View style={[styles.glow, styles.glowBottom]} />

      <DeviceShell>
        <View style={styles.container}>
          <View style={styles.logoWrap}>
            <Image source={require('../../assets/kujuana_logo.png')} style={styles.logoImage} resizeMode="contain" />
            <Text style={styles.brand}>KUJUANA</Text>
          </View>

          <Text style={styles.step}>Step 2 of 5</Text>
          <Text style={styles.title}>Your background & lifestyle</Text>

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <View style={styles.grid}>
          <View style={styles.row3}>
            <SelectTile
              title={'Lifestyle\noptions'}
              selected={selected.lifestyle}
              onPress={() => toggle('lifestyle')}
              icons={(
                <>
                  <Ionicons name="airplane-outline" size={30} color={GOLD} />
                  <Ionicons name="barbell-outline" size={30} color={GOLD} />
                  <Ionicons name="happy-outline" size={30} color={GOLD} />
                </>
              )}
            />
            <SelectTile
              title={'Personality\ntraits'}
              selected={selected.personality}
              onPress={() => toggle('personality')}
              icons={(
                <>
                  <Ionicons name="bulb-outline" size={30} color={GOLD} />
                  <Ionicons name="happy-outline" size={30} color={GOLD} />
                  <Ionicons name="trending-up-outline" size={30} color={GOLD} />
                </>
              )}
            />
            <SelectTile
              title={'Children\nstatus'}
              selected={selected.childrenStatus}
              onPress={() => toggle('childrenStatus')}
              icons={<Ionicons name="people-outline" size={34} color={GOLD} />}
            />
          </View>

          <View style={styles.row2}>
            <SelectTile
              title={'Future\nchildren\npreference'}
              selected={selected.futureChildren}
              onPress={() => toggle('futureChildren')}
              icons={(
                <>
                  <Ionicons name="apps-outline" size={32} color={GOLD} />
                  <Ionicons name="apps-outline" size={32} color={GOLD} />
                </>
              )}
            />
            <SelectTile
              title={'Emotional\nreadiness'}
              selected={selected.emotionalReadiness}
              onPress={() => toggle('emotionalReadiness')}
              icons={(
                <>
                  <Ionicons name="heart-outline" size={32} color={GOLD} />
                  <Ionicons name="scale-outline" size={32} color={GOLD} />
                </>
              )}
            />
          </View>
          </View>

          <Pressable
            style={{ marginTop: 22, width: '100%' }}
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

function SelectTile({
  title,
  selected,
  onPress,
  icons,
}: {
  title: string;
  selected: boolean;
  onPress: () => void;
  icons: React.ReactNode;
}) {
  return (
    <Pressable onPress={onPress} style={styles.tilePress}>
      <View style={[styles.tileOuter, selected && styles.tileOuterSelected]}>
        <LinearGradient
          colors={
            selected
              ? ['rgba(230,196,106,0.92)', 'rgba(230,196,106,0.30)']
              : ['rgba(230,196,106,0.45)', 'rgba(230,196,106,0.12)']
          }
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.tileBorder}
        >
          <View style={styles.tileInner}>
            <View style={styles.tileGloss} />
            <Text style={styles.tileTitle}>{title}</Text>
            <View style={styles.tileIcons}>{icons}</View>

            {selected ? (
              <View style={styles.checkBadge}>
                <Ionicons name="checkmark" size={16} color="#1C0C2A" />
              </View>
            ) : null}
          </View>
        </LinearGradient>
      </View>
    </Pressable>
  );
}

const GOLD = '#FFD700';

const styles = StyleSheet.create({
  bg: { flex: 1 },
  container: {
    flex: 1,
    paddingTop: 26,
    paddingHorizontal: 18,
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
    backgroundColor: 'rgba(233,197,108,0.18)',
    opacity: 0.9,
  },
  glowTop: { top: -90, right: -120 },
  glowMid: { top: 210, left: -150, opacity: 0.5 },
  glowBottom: { bottom: -150, right: -140, opacity: 0.55 },
  cornerArt: {
    position: 'absolute',
    width: 190,
    height: 190,
    borderWidth: 1,
    borderColor: 'rgba(230,196,106,0.18)',
    borderRadius: 22,
    transform: [{ rotate: '12deg' }],
  },
  cornerTopRight: { top: -30, right: -40 },
  cornerBottomLeft: { bottom: -40, left: -40, transform: [{ rotate: '-10deg' }] },
  logoWrap: { alignItems: 'center', marginBottom: 10 },
  logoImage: {
    width: 112,
    height: 112,
    marginBottom: 12,
    shadowColor: 'rgba(255, 215, 0, 0.9)',
    shadowOpacity: 0.55,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 0 },
  },
  brand: {
    color: GOLD,
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: 2,
    textShadowColor: 'rgba(255, 215, 0, 0.65)',
    textShadowRadius: 10,
  },
  step: {
    marginTop: 10,
    color: 'rgba(255,255,255,0.72)',
    fontSize: 16,
    fontWeight: '600',
  },
  title: {
    marginTop: 14,
    color: GOLD,
    fontSize: 34,
    fontWeight: '900',
    textAlign: 'center',
    lineHeight: 40,
    textShadowColor: 'rgba(255, 215, 0, 0.6)',
    textShadowRadius: 12,
  },
  grid: {
    width: '100%',
    marginTop: 18,
  },
  row3: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  row2: {
    marginTop: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  tilePress: { flex: 1 },
  tileOuter: {
    borderRadius: 18,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.02)',
  },
  tileOuterSelected: {
    shadowColor: GOLD,
    shadowOpacity: Platform.OS === 'ios' ? 0.35 : 0.9,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 10 },
    elevation: 10,
  },
  tileBorder: {
    borderRadius: 18,
    padding: 1.4,
  },
  tileInner: {
    height: 160,
    borderRadius: 17,
    backgroundColor: 'rgba(0,0,0,0.18)',
    paddingHorizontal: 12,
    paddingTop: 14,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 14,
    position: 'relative',
    overflow: 'hidden',
  },
  tileGloss: {
    position: 'absolute',
    top: -20,
    left: -30,
    width: 120,
    height: 220,
    backgroundColor: 'rgba(255,255,255,0.10)',
    transform: [{ rotate: '18deg' }],
  },
  tileTitle: {
    color: 'rgba(255,255,255,0.92)',
    fontSize: 18,
    fontWeight: '800',
    textAlign: 'center',
    lineHeight: 22,
  },
  tileIcons: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 14,
    marginBottom: 2,
  },
  checkBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 28,
    height: 28,
    borderRadius: 18,
    backgroundColor: GOLD,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.25)',
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
