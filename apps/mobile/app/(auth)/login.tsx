import { useRef, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Redirect, useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AppScreen } from '@/components/ui/AppScreen';
import { FadeIn } from '@/components/ui/FadeIn';
import { GlassCard } from '@/components/ui/GlassCard';
import { GoldButton } from '@/components/ui/GoldButton';
import { KujuanaLogo } from '@/components/ui/KujuanaLogo';
import { API_CONFIG } from '@/lib/api/config';
import { useSession } from '@/lib/state/session';
import { COLORS, FONT, RADIUS } from '@/lib/theme/tokens';

export default function LoginScreen() {
  const router = useRouter();
  const { status, authError, signIn } = useSession();

  const passwordRef = useRef<TextInput>(null);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [focusedField, setFocusedField] = useState<'email' | 'password' | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  if (status === 'signed_in') {
    return <Redirect href="/(tabs)" />;
  }

  async function onSubmit() {
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail || !password.trim()) {
      setLocalError('Email and password are required.');
      return;
    }

    setSubmitting(true);
    setLocalError(null);

    try {
      await signIn(normalizedEmail, password);
      router.replace('/(tabs)');
    } catch {
      // Error is surfaced by authError/localError state.
    } finally {
      setSubmitting(false);
    }
  }

  const visibleError = localError || authError;
  const showNetworkHint =
    visibleError?.toLowerCase().includes('network') ||
    visibleError?.toLowerCase().includes('timed out') ||
    visibleError?.toLowerCase().includes('failed to fetch');

  async function openSupport(path: '/help' | '/contact') {
    const url = `${API_CONFIG.webUrl}${path}`;
    try {
      await Linking.openURL(url);
      setLocalError(null);
    } catch {
      setLocalError(`Unable to open ${path === '/help' ? 'Help Centre' : 'Contact Us'}. Visit: ${url}`);
    }
  }

  return (
    <AppScreen contentContainerStyle={styles.screenContent}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
        >
          <FadeIn>
            <View style={styles.heroSection}>
              <View style={styles.brandCard}>
                <KujuanaLogo size={84} showWordmark={false} style={styles.brandLogo} />
                <Text style={styles.brandName}>Kujuana</Text>
                <Text style={styles.brandCaption}>Dating With Intention</Text>
              </View>
              <View style={styles.trustRow}>
                <View style={styles.trustPill}>
                  <MaterialCommunityIcons
                    name="shield-check-outline"
                    size={14}
                    color={COLORS.goldGlow}
                  />
                  <Text style={styles.trustText}>Private</Text>
                </View>
                <View style={styles.trustPill}>
                  <MaterialCommunityIcons name="heart-outline" size={14} color={COLORS.goldGlow} />
                  <Text style={styles.trustText}>Intentional</Text>
                </View>
                <View style={styles.trustPill}>
                  <MaterialCommunityIcons
                    name="account-check-outline"
                    size={14}
                    color={COLORS.goldGlow}
                  />
                  <Text style={styles.trustText}>Real Profiles</Text>
                </View>
              </View>
            </View>
            <Text style={styles.signInTitle}>Sign in</Text>
          </FadeIn>

          <FadeIn delay={120}>
            <GlassCard highlighted style={styles.formCard}>
              <Text style={styles.label}>Email</Text>
              <View style={styles.inputRow}>
                <MaterialCommunityIcons
                  name="email-outline"
                  size={18}
                  color={COLORS.textMuted}
                  style={styles.inputIcon}
                />
                <TextInput
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoComplete="email"
                  textContentType="emailAddress"
                  keyboardType="email-address"
                  returnKeyType="next"
                  blurOnSubmit={false}
                  autoFocus
                  editable={!submitting}
                  placeholder="you@example.com"
                  placeholderTextColor="rgba(196,168,130,0.75)"
                  value={email}
                  onChangeText={setEmail}
                  onFocus={() => setFocusedField('email')}
                  onBlur={() => setFocusedField((current) => (current === 'email' ? null : current))}
                  onSubmitEditing={() => passwordRef.current?.focus()}
                  style={[
                    styles.input,
                    styles.inputWithIcon,
                    focusedField === 'email' && styles.inputFocused,
                    submitting && styles.inputDisabled,
                  ]}
                />
              </View>

              <Text style={[styles.label, styles.labelSpacing]}>Password</Text>
              <View style={styles.passwordWrap}>
                <MaterialCommunityIcons
                  name="lock-outline"
                  size={18}
                  color={COLORS.textMuted}
                  style={styles.inputIcon}
                />
                <TextInput
                  ref={passwordRef}
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoComplete="password"
                  textContentType="password"
                  secureTextEntry={!showPassword}
                  returnKeyType="done"
                  editable={!submitting}
                  placeholder="Your password"
                  placeholderTextColor="rgba(196,168,130,0.75)"
                  value={password}
                  onChangeText={setPassword}
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField((current) => (current === 'password' ? null : current))}
                  onSubmitEditing={onSubmit}
                  style={[
                    styles.input,
                    styles.passwordInput,
                    focusedField === 'password' && styles.inputFocused,
                    submitting && styles.inputDisabled,
                  ]}
                />
                <Pressable
                  onPress={() => setShowPassword((prev) => !prev)}
                  style={styles.eyeButton}
                  hitSlop={8}
                >
                  <MaterialCommunityIcons
                    name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={18}
                    color={COLORS.textMuted}
                  />
                </Pressable>
              </View>
              <View style={styles.helpRow}>
                <Pressable onPress={() => void openSupport('/help')}>
                  <Text style={styles.helpLinkText}>Need help signing in?</Text>
                </Pressable>
              </View>

              <View style={styles.errorBlock}>
                {visibleError ? <Text style={styles.errorText}>{visibleError}</Text> : null}
              </View>

              {showNetworkHint ? (
                <Text style={styles.hintText}>{`Check API reachability: ${API_CONFIG.baseUrl}`}</Text>
              ) : null}

              {submitting ? (
                <View style={styles.loadingButton}>
                  <ActivityIndicator size="small" color={COLORS.goldGlow} />
                  <Text style={styles.loadingText}>Signing in...</Text>
                </View>
              ) : (
                <GoldButton label="Sign in" onPress={onSubmit} />
              )}

              <View style={styles.linksRow}>
                <Pressable onPress={() => router.push('/(auth)/register')}>
                  <Text style={styles.linkText}>Create account</Text>
                </Pressable>
                <Pressable onPress={() => void openSupport('/contact')}>
                  <Text style={styles.linkText}>Connection help</Text>
                </Pressable>
              </View>
            </GlassCard>
          </FadeIn>
        </ScrollView>
      </KeyboardAvoidingView>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  screenContent: {
    paddingBottom: 24,
  },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingBottom: 24,
  },
  heroSection: {
    paddingVertical: 2,
  },
  brandCard: {
    alignSelf: 'center',
    marginBottom: 16,
    paddingHorizontal: 2,
    paddingVertical: 2,
    alignItems: 'center',
    gap: 2,
  },
  brandLogo: {
    justifyContent: 'center',
  },
  brandName: {
    color: COLORS.goldChampagne,
    fontFamily: FONT.display,
    fontSize: 50,
    letterSpacing: 1.1,
    ...(Platform.OS === 'web'
      ? ({
          textShadow: '0px 3px 12px rgba(212, 175, 55, 0.42)',
        } as any)
      : {
          textShadowColor: 'rgba(212,175,55,0.42)',
          textShadowOffset: { width: 0, height: 3 },
          textShadowRadius: 12,
        }),
  },
  brandCaption: {
    color: COLORS.goldGlow,
    fontFamily: FONT.bodySemiBold,
    fontSize: 22,
    letterSpacing: 0.85,
    ...(Platform.OS === 'web'
      ? ({
          textShadow: '0px 0px 10px rgba(212, 175, 55, 0.85)',
        } as any)
      : {
          textShadowColor: 'rgba(212,175,55,0.85)',
          textShadowOffset: { width: 0, height: 0 },
          textShadowRadius: 10,
        }),
  },
  trustRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  trustPill: {
    borderRadius: RADIUS.pill,
    borderWidth: 1,
    borderColor: COLORS.stroke,
    backgroundColor: 'rgba(24,2,31,0.52)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  trustText: {
    color: COLORS.goldGlow,
    fontFamily: FONT.bodyMedium,
    fontSize: 12,
    letterSpacing: 0.3,
  },
  signInTitle: {
    color: COLORS.offWhite,
    fontFamily: FONT.displayBold,
    fontSize: 36,
    lineHeight: 38,
    marginTop: 14,
    marginBottom: 16,
    textAlign: 'center',
    letterSpacing: 0.8,
  },
  formCard: {
    paddingTop: 20,
  },
  label: {
    color: COLORS.goldChampagne,
    fontFamily: FONT.bodyMedium,
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  inputRow: {
    position: 'relative',
    justifyContent: 'center',
  },
  inputIcon: {
    position: 'absolute',
    left: 12,
    zIndex: 1,
  },
  labelSpacing: {
    marginTop: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.strokeSoft,
    borderRadius: RADIUS.md,
    backgroundColor: 'rgba(255,255,255,0.04)',
    color: COLORS.offWhite,
    fontFamily: FONT.body,
    fontSize: 15,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  inputWithIcon: {
    paddingLeft: 38,
  },
  inputFocused: {
    borderColor: COLORS.goldPrimary,
    backgroundColor: 'rgba(212,175,55,0.08)',
  },
  inputDisabled: {
    opacity: 0.76,
  },
  passwordWrap: {
    position: 'relative',
    justifyContent: 'center',
  },
  passwordInput: {
    paddingLeft: 38,
    paddingRight: 42,
  },
  eyeButton: {
    position: 'absolute',
    right: 12,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  helpRow: {
    marginTop: 8,
    alignItems: 'flex-end',
  },
  helpLinkText: {
    color: COLORS.goldChampagne,
    fontFamily: FONT.body,
    fontSize: 12,
    textDecorationLine: 'underline',
  },
  errorBlock: {
    minHeight: 22,
    marginTop: 8,
    justifyContent: 'center',
  },
  errorText: {
    color: COLORS.danger,
    fontFamily: FONT.body,
    fontSize: 12,
  },
  hintText: {
    marginTop: 4,
    color: COLORS.textMuted,
    fontFamily: FONT.body,
    fontSize: 12,
  },
  loadingButton: {
    borderRadius: RADIUS.pill,
    borderWidth: 1,
    borderColor: COLORS.stroke,
    backgroundColor: 'rgba(212,175,55,0.14)',
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  loadingText: {
    color: COLORS.goldGlow,
    fontFamily: FONT.bodySemiBold,
    letterSpacing: 0.5,
  },
  linksRow: {
    marginTop: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  linkText: {
    color: COLORS.textMuted,
    fontFamily: FONT.body,
    fontSize: 12,
    textDecorationLine: 'underline',
  },
});
