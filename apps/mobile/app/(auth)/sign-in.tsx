import { useState } from 'react';
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
import { ApiError } from '@/lib/api/types';
import { signInWithPassword } from '@/lib/auth/bootstrap';

export default function SignInScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function submit() {
    setError('');
    if (!email.trim() || !password) {
      setError('Please enter your email and password.');
      return;
    }
    setLoading(true);
    try {
      await signInWithPassword({ email: email.trim().toLowerCase(), password });
      // Auth store updates → index.tsx redirect handles navigation automatically
    } catch (err) {
      if (err instanceof ApiError || err instanceof Error) {
        setError(err.message);
      } else {
        setError('Unable to sign in right now. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <LinearGradient
      colors={['#140321', '#2A0B46', '#4B165E', '#2A0B46', '#140321']}
      start={{ x: 0.15, y: 0.1 }}
      end={{ x: 0.85, y: 0.95 }}
      style={styles.bg}
    >
      <View style={[styles.glow, styles.glowTopRight]} />
      <View style={[styles.glow, styles.glowBottomRight]} />
      <View style={[styles.glow, styles.glowBottomLeft]} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          bounces={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.phoneFrame}>
            <View style={styles.phoneNotch} />

            <View style={styles.logoWrap}>
              <View style={styles.logoStage}>
                <View style={styles.logoHalo} />
                <Image
                  source={require('../../assets/kujuana_logo.png')}
                  style={styles.logoImage}
                  resizeMode="contain"
                />
              </View>
              <Text style={styles.brand}>KUJUANA</Text>
              <Text style={styles.tagline}>Dating with intention.</Text>
            </View>

            <Text style={styles.title}>Welcome back</Text>

            {error ? (
              <View style={styles.errorRow}>
                <Ionicons name="alert-circle-outline" size={14} color="#f3b0b0" />
                <Text style={styles.error}> {error}</Text>
              </View>
            ) : null}

            <View style={styles.cardOuter}>
              <LinearGradient
                colors={['rgba(255,255,255,0.12)', 'rgba(255,255,255,0.06)']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.card}
              >
                <GoldInput
                  icon="mail-outline"
                  placeholder="Email address"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />

                <View style={{ marginTop: 14 }}>
                  <View style={styles.inputOuter}>
                    <LinearGradient
                      colors={['rgba(255, 215, 0, 0.95)', 'rgba(255, 215, 0, 0.35)']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.inputBorder}
                    >
                      <View style={styles.inputInner}>
                        <Ionicons
                          name="lock-closed-outline"
                          size={18}
                          color="rgba(255,255,255,0.85)"
                          style={{ marginRight: 10 }}
                        />
                        <TextInput
                          placeholder="Password"
                          placeholderTextColor="rgba(255,255,255,0.60)"
                          value={password}
                          onChangeText={setPassword}
                          secureTextEntry={!showPass}
                          style={styles.input}
                          autoCapitalize="none"
                          onSubmitEditing={submit}
                          returnKeyType="go"
                        />
                        <Pressable onPress={() => setShowPass((s) => !s)} hitSlop={12}>
                          <Ionicons
                            name={showPass ? 'eye-outline' : 'eye-off-outline'}
                            size={18}
                            color="rgba(255,255,255,0.70)"
                          />
                        </Pressable>
                      </View>
                    </LinearGradient>
                  </View>
                </View>

                <Pressable style={styles.btnWrap} onPress={submit} disabled={loading}>
                  <LinearGradient
                    colors={['#FFE680', '#FFD700', '#D9A300']}
                    start={{ x: 0.1, y: 0.2 }}
                    end={{ x: 0.9, y: 0.8 }}
                    style={[styles.btn, loading && styles.btnDisabled]}
                  >
                    <Text style={styles.btnText}>{loading ? 'Signing in...' : 'Sign In'}</Text>
                  </LinearGradient>
                </Pressable>

                <View style={styles.signupRow}>
                  <Text style={styles.signupText}>Need an account? </Text>
                  <Pressable onPress={() => router.replace('/(auth)/register')}>
                    <Text style={styles.signupLink}>Create Account</Text>
                  </Pressable>
                </View>
              </LinearGradient>
            </View>

            <Pressable style={styles.backRow} onPress={() => router.back()}>
              <Ionicons name="chevron-back-outline" size={14} color="rgba(255,215,0,0.65)" />
              <Text style={styles.backText}>Back to options</Text>
            </Pressable>

            <Text style={styles.footer}>Private. Verified. Secure.</Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

function GoldInput(props: {
  icon: keyof typeof Ionicons.glyphMap;
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  keyboardType?: 'default' | 'email-address' | 'phone-pad';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
}) {
  const { icon, ...rest } = props;
  return (
    <View style={styles.inputOuter}>
      <LinearGradient
        colors={['rgba(217, 179, 95, 0.9)', 'rgba(217, 179, 95, 0.35)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.inputBorder}
      >
        <View style={styles.inputInner}>
          <Ionicons name={icon} size={18} color="rgba(255,255,255,0.85)" style={{ marginRight: 10 }} />
          <TextInput placeholderTextColor="rgba(255,255,255,0.60)" style={styles.input} {...rest} />
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1 },
  container: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 28,
    paddingHorizontal: 18,
  },
  glow: {
    position: 'absolute',
    width: 260,
    height: 260,
    borderRadius: 260,
    backgroundColor: 'rgba(233, 197, 108, 0.22)',
    opacity: 0.9,
    transform: [{ scale: 1.2 }],
  },
  glowTopRight: { top: -80, right: -120 },
  glowBottomRight: { bottom: -110, right: -130 },
  glowBottomLeft: { bottom: -150, left: -140, opacity: 0.55 },
  phoneFrame: {
    width: 340,
    maxWidth: '100%',
    borderRadius: 34,
    paddingTop: 34,
    paddingHorizontal: 20,
    paddingBottom: 22,
    backgroundColor: 'rgba(0,0,0,0.18)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
    shadowColor: '#000',
    shadowOpacity: 0.35,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8,
    overflow: 'hidden',
  },
  phoneNotch: {
    position: 'absolute',
    top: 10,
    alignSelf: 'center',
    width: 120,
    height: 26,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.60)',
  },
  logoWrap: { alignItems: 'center', marginTop: 8 },
  logoStage: {
    width: 160,
    height: 160,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoHalo: {
    position: 'absolute',
    width: 152,
    height: 152,
    borderRadius: 999,
    backgroundColor: 'rgba(255, 215, 0, 0.15)',
    shadowColor: '#FFD700',
    shadowOpacity: 0.48,
    shadowRadius: 26,
    shadowOffset: { width: 0, height: 0 },
  },
  logoImage: { width: 144, height: 144 },
  brand: {
    marginTop: 10,
    color: '#FFD700',
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: 3,
    textShadowColor: 'rgba(255, 215, 0, 0.55)',
    textShadowRadius: 10,
  },
  tagline: { marginTop: 4, color: 'rgba(255,255,255,0.75)', fontSize: 13 },
  title: {
    marginTop: 18,
    marginBottom: 6,
    textAlign: 'center',
    color: '#FFD700',
    fontSize: 28,
    fontWeight: '800',
    textShadowColor: 'rgba(255, 215, 0, 0.55)',
    textShadowRadius: 10,
  },
  errorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  error: { color: '#f3b0b0', fontSize: 12 },
  cardOuter: {
    marginTop: 8,
    borderRadius: 22,
    padding: 1.2,
    borderColor: 'rgba(230, 196, 106, 0.20)',
    borderWidth: 1,
    backgroundColor: 'rgba(255,255,255,0.02)',
  },
  card: {
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 16,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  inputOuter: { marginTop: 14 },
  inputBorder: { borderRadius: 18, padding: 1.2 },
  inputInner: {
    borderRadius: 17,
    paddingHorizontal: 14,
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.18)',
  },
  input: { flex: 1, color: 'rgba(255,255,255,0.92)', fontSize: 14 },
  btnWrap: { marginTop: 18 },
  btn: { height: 52, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  btnDisabled: { opacity: 0.7 },
  btnText: { color: '#1C0C2A', fontSize: 16, fontWeight: '800' },
  signupRow: {
    marginTop: 14,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signupText: { color: 'rgba(255,255,255,0.70)', fontSize: 12.5 },
  signupLink: {
    color: '#FFD700',
    fontSize: 12.5,
    fontWeight: '700',
    textShadowColor: 'rgba(255, 215, 0, 0.45)',
    textShadowRadius: 7,
  },
  backRow: {
    marginTop: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  backText: { color: 'rgba(255,215,0,0.65)', fontSize: 12.5 },
  footer: {
    marginTop: 12,
    textAlign: 'center',
    color: 'rgba(255,255,255,0.50)',
    fontSize: 11,
    letterSpacing: 0.5,
  },
});
