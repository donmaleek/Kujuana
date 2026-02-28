import { useEffect, useMemo, useRef } from 'react';
import { Animated, Dimensions, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '@/lib/config/theme';

export default function WelcomeScreen() {
  const floatAnim = useRef(new Animated.Value(0)).current;
  const loadingAnim = useRef(new Animated.Value(0.2)).current;
  const hasNavigated = useRef(false);
  const screen = Dimensions.get('window');

  const phoneFrame = useMemo(() => {
    const maxWidth = 390;
    const maxHeight = 844;
    const width = Math.min(maxWidth, screen.width - 28);
    const height = Math.min(maxHeight, screen.height - 70);
    return { width, height };
  }, [screen.height, screen.width]);

  useEffect(() => {
    const floating = Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: 1,
          duration: 8000,
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 8000,
          useNativeDriver: true,
        }),
      ]),
    );

    const loading = Animated.loop(
      Animated.sequence([
        Animated.timing(loadingAnim, {
          toValue: 0.8,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(loadingAnim, {
          toValue: 0.2,
          duration: 1500,
          useNativeDriver: true,
        }),
      ]),
    );

    floating.start();
    loading.start();

    return () => {
      floating.stop();
      loading.stop();
    };
  }, [floatAnim, loadingAnim]);

  function moveToNext() {
    if (hasNavigated.current) return;
    hasNavigated.current = true;
    router.replace('/(auth)/login');
  }

  useEffect(() => {
    const timer = setTimeout(moveToNext, 2800);
    return () => clearTimeout(timer);
  }, []);

  return (
    <LinearGradient
      colors={['#07030F', '#140724', '#2B1248', '#18092E', '#07030F']}
      start={{ x: 0.1, y: 0.06 }}
      end={{ x: 0.9, y: 0.94 }}
      style={styles.page}
    >
      <StatusBar style="light" />
      <SafeAreaView style={styles.safeArea}>
        <Animated.View
          style={[
            styles.goldWave,
            {
              transform: [
                {
                  rotate: floatAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0deg', '15deg'],
                  }),
                },
                {
                  scale: floatAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [1, 1.1],
                  }),
                },
              ],
            },
          ]}
        >
          <View style={styles.goldBlobOne} />
          <View style={styles.goldBlobTwo} />
        </Animated.View>

        <Pressable
          style={[styles.phone, phoneFrame]}
          onPress={moveToNext}
          accessibilityRole="button"
          accessibilityHint="Continue to account options"
        >
          <LinearGradient
            colors={['#1A0C2E', '#311257', '#1A0C2E']}
            start={{ x: 0.1, y: 0.06 }}
            end={{ x: 0.9, y: 0.94 }}
            style={styles.phoneInner}
          >
            <View style={styles.logoStage}>
              <View style={styles.logoHalo} />
              <Image source={require('../../assets/kujuana_logo.png')} style={styles.logoImage} resizeMode="contain" />
            </View>
            <Text style={styles.brand}>KUJUANA</Text>
            <Text style={styles.tagline}>
              Dating with{'\n'}
              intention.
            </Text>
            <View style={styles.progressContainer}>
              <Animated.View style={[styles.progress, { transform: [{ scaleX: loadingAnim }] }]} />
            </View>
            <Text style={styles.tapHint}>Loading your private lounge...</Text>
          </LinearGradient>
        </Pressable>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  goldWave: {
    position: 'absolute',
    width: '200%',
    height: '200%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  goldBlobOne: {
    position: 'absolute',
    width: 540,
    height: 540,
    borderRadius: 999,
    backgroundColor: 'rgba(227, 193, 111, 0.34)',
    top: '20%',
    left: '18%',
    opacity: 0.52,
  },
  goldBlobTwo: {
    position: 'absolute',
    width: 580,
    height: 580,
    borderRadius: 999,
    backgroundColor: 'rgba(125, 87, 201, 0.28)',
    bottom: '16%',
    right: '14%',
    opacity: 0.55,
  },
  phone: {
    borderRadius: 40,
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOpacity: 0.62,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 16 },
    elevation: 22,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 0,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  phoneInner: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  logoStage: {
    width: 264,
    height: 264,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },
  logoHalo: {
    position: 'absolute',
    width: 252,
    height: 252,
    borderRadius: 999,
    backgroundColor: 'rgba(255, 215, 0, 0.16)',
    shadowColor: '#FFD700',
    shadowOpacity: 0.5,
    shadowRadius: 34,
    shadowOffset: { width: 0, height: 0 },
  },
  logoImage: {
    width: 236,
    height: 236,
  },
  brand: {
    fontSize: 22,
    color: theme.colors.primary,
    letterSpacing: 4,
    marginBottom: 28,
    textShadowColor: 'rgba(212, 175, 55, 0.82)',
    textShadowRadius: 12,
    fontFamily: theme.font.serif,
  },
  tagline: {
    fontSize: 24,
    textAlign: 'center',
    color: theme.colors.goldGlow,
    width: '80%',
    marginBottom: 84,
    textShadowColor: 'rgba(212, 175, 55, 0.64)',
    textShadowRadius: 12,
    lineHeight: 32,
    fontFamily: theme.font.serif,
  },
  progressContainer: {
    width: '70%',
    height: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 50,
    overflow: 'hidden',
  },
  progress: {
    height: '100%',
    width: '100%',
    alignSelf: 'flex-start',
    borderRadius: 50,
    backgroundColor: '#E8C877',
    shadowColor: '#fffacd',
    shadowOpacity: 0.7,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 0 },
  },
  tapHint: {
    marginTop: 14,
    color: 'rgba(255, 255, 255, 0.72)',
    fontSize: 12,
    letterSpacing: 0.4,
    fontFamily: theme.font.sans,
  },
});
