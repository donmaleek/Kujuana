import { useRef, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
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
import { ApiError, apiClient } from '@/lib/api/client';
import { useSession } from '@/lib/state/session';
import { COLORS, FONT, RADIUS } from '@/lib/theme/tokens';

function normalizePhone(value: string): string {
  const compact = value.replace(/[\s()-]/g, '');
  if (compact.startsWith('+')) return compact;
  if (compact.startsWith('00')) return `+${compact.slice(2)}`;
  if (compact.startsWith('0') && compact.length === 10) return `+254${compact.slice(1)}`;
  if (/^254\d{9}$/.test(compact)) return `+${compact}`;
  if (/^7\d{8}$/.test(compact)) return `+254${compact}`;
  return compact;
}

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function isStrongPassword(value: string): boolean {
  return value.length >= 8 && /[A-Z]/.test(value) && /[0-9]/.test(value);
}

function isValidE164(value: string): boolean {
  return /^\+[1-9]\d{7,14}$/.test(value);
}

export default function RegisterScreen() {
  const router = useRouter();
  const { status, signIn } = useSession();

  const emailRef = useRef<TextInput>(null);
  const phoneRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [focusedField, setFocusedField] = useState<'fullName' | 'email' | 'phone' | 'password' | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const normalizedEmail = email.trim().toLowerCase();
  const normalizedPhone = normalizePhone(phone);

  if (status === 'signed_in') {
    return <Redirect href="/(tabs)" />;
  }

  async function onSubmit() {
    if (!fullName.trim() || !normalizedEmail || !normalizedPhone || !password.trim()) {
      setError('All fields are required.');
      return;
    }

    if (fullName.trim().length < 2) {
      setError('Full name must have at least 2 characters.');
      return;
    }

    if (!isValidEmail(normalizedEmail)) {
      setError('Enter a valid email address.');
      return;
    }

    if (!isValidE164(normalizedPhone)) {
      setError('Phone must be in E.164 format, for example +254712345678.');
      return;
    }

    if (!isStrongPassword(password)) {
      setError('Password must be at least 8 characters and include 1 uppercase letter and 1 number.');
      return;
    }

    if (!agreedToTerms) {
      setError('You must agree to terms to create an account.');
      return;
    }

    setSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const result = await apiClient.register({
        fullName: fullName.trim(),
        email: normalizedEmail,
        phone: normalizedPhone,
        password,
        agreedToTerms,
      });

      setSuccess(result.message);

      try {
        await signIn(normalizedEmail, password);
        router.replace('/(tabs)');
      } catch (signInError) {
        const message = signInError instanceof Error ? signInError.message : 'Account created. Please sign in.';
        if (message.toLowerCase().includes('verify')) {
          setSuccess(result.message || 'Account created. Verify your email, then sign in.');
          router.replace('/(auth)/login');
          return;
        }
        throw signInError;
      }
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Unable to create account right now.');
      }
    } finally {
      setSubmitting(false);
    }
  }

  const showNetworkHint =
    error?.toLowerCase().includes('network') ||
    error?.toLowerCase().includes('timed out') ||
    error?.toLowerCase().includes('failed to fetch');

  async function openSupport(path: '/help' | '/contact') {
    const url = `${API_CONFIG.webUrl}${path}`;
    try {
      await Linking.openURL(url);
      setError(null);
    } catch {
      setError(`Unable to open ${path === '/help' ? 'Help Centre' : 'Contact Us'}. Visit: ${url}`);
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
                <KujuanaLogo size={76} showWordmark={false} style={styles.brandLogo} />
                <Text style={styles.brandName}>Kujuana</Text>
                <Text style={styles.brandCaption}>Dating With Intention</Text>
              </View>

              <View style={styles.trustRow}>
                <View style={styles.trustPill}>
                  <MaterialCommunityIcons name="crown-outline" size={14} color={COLORS.goldGlow} />
                  <Text style={styles.trustText}>Curated</Text>
                </View>
                <View style={styles.trustPill}>
                  <MaterialCommunityIcons name="shield-check-outline" size={14} color={COLORS.goldGlow} />
                  <Text style={styles.trustText}>Secure</Text>
                </View>
                <View style={styles.trustPill}>
                  <MaterialCommunityIcons name="heart-outline" size={14} color={COLORS.goldGlow} />
                  <Text style={styles.trustText}>Meaningful</Text>
                </View>
              </View>
            </View>

            <Text style={styles.registerTitle}>Create account</Text>
          </FadeIn>

          <FadeIn delay={120}>
            <GlassCard highlighted style={styles.formCard}>
              <Text style={styles.label}>Full name</Text>
              <View style={styles.inputRow}>
                <MaterialCommunityIcons
                  name="account-outline"
                  size={18}
                  color={COLORS.textMuted}
                  style={styles.inputIcon}
                />
                <TextInput
                  autoFocus
                  autoCapitalize="words"
                  autoCorrect={false}
                  autoComplete="name"
                  textContentType="name"
                  returnKeyType="next"
                  blurOnSubmit={false}
                  editable={!submitting}
                  placeholder="Your full name"
                  placeholderTextColor="rgba(196,168,130,0.75)"
                  value={fullName}
                  onChangeText={setFullName}
                  onFocus={() => setFocusedField('fullName')}
                  onBlur={() => setFocusedField((current) => (current === 'fullName' ? null : current))}
                  onSubmitEditing={() => emailRef.current?.focus()}
                  style={[
                    styles.input,
                    styles.inputWithIcon,
                    focusedField === 'fullName' && styles.inputFocused,
                    submitting && styles.inputDisabled,
                  ]}
                />
              </View>

              <Text style={[styles.label, styles.labelSpacing]}>Email</Text>
              <View style={styles.inputRow}>
                <MaterialCommunityIcons
                  name="email-outline"
                  size={18}
                  color={COLORS.textMuted}
                  style={styles.inputIcon}
                />
                <TextInput
                  ref={emailRef}
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoComplete="email"
                  textContentType="emailAddress"
                  keyboardType="email-address"
                  returnKeyType="next"
                  blurOnSubmit={false}
                  editable={!submitting}
                  placeholder="you@example.com"
                  placeholderTextColor="rgba(196,168,130,0.75)"
                  value={email}
                  onChangeText={setEmail}
                  onFocus={() => setFocusedField('email')}
                  onBlur={() => setFocusedField((current) => (current === 'email' ? null : current))}
                  onSubmitEditing={() => phoneRef.current?.focus()}
                  style={[
                    styles.input,
                    styles.inputWithIcon,
                    focusedField === 'email' && styles.inputFocused,
                    submitting && styles.inputDisabled,
                  ]}
                />
              </View>

              <Text style={[styles.label, styles.labelSpacing]}>Phone</Text>
              <View style={styles.inputRow}>
                <MaterialCommunityIcons
                  name="phone-outline"
                  size={18}
                  color={COLORS.textMuted}
                  style={styles.inputIcon}
                />
                <TextInput
                  ref={phoneRef}
                  autoCapitalize="none"
                  autoCorrect={false}
                  keyboardType="phone-pad"
                  returnKeyType="next"
                  blurOnSubmit={false}
                  editable={!submitting}
                  placeholder="+254712345678"
                  placeholderTextColor="rgba(196,168,130,0.75)"
                  value={phone}
                  onChangeText={setPhone}
                  onFocus={() => setFocusedField('phone')}
                  onBlur={() => setFocusedField((current) => (current === 'phone' ? null : current))}
                  onSubmitEditing={() => passwordRef.current?.focus()}
                  style={[
                    styles.input,
                    styles.inputWithIcon,
                    focusedField === 'phone' && styles.inputFocused,
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
                  autoComplete="password-new"
                  textContentType="newPassword"
                  secureTextEntry={!showPassword}
                  returnKeyType="done"
                  editable={!submitting}
                  placeholder="At least 8 chars, 1 uppercase, 1 number"
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

              <View style={styles.termsRow}>
                <Switch
                  value={agreedToTerms}
                  onValueChange={setAgreedToTerms}
                  disabled={submitting}
                  trackColor={{ false: 'rgba(255,255,255,0.16)', true: 'rgba(212,175,55,0.45)' }}
                  thumbColor={agreedToTerms ? COLORS.goldGlow : 'rgba(255,255,255,0.75)'}
                />
                <Text style={styles.termsText}>I agree to Kujuana Terms and Privacy Policy</Text>
              </View>

              <View style={styles.helpRow}>
                <Pressable onPress={() => void openSupport('/help')}>
                  <Text style={styles.helpLinkText}>Need help creating your account?</Text>
                </Pressable>
              </View>

              <View style={styles.statusBlock}>
                {error ? <Text style={styles.errorText}>{error}</Text> : null}
                {!error && success ? <Text style={styles.successText}>{success}</Text> : null}
              </View>

              {showNetworkHint ? (
                <Text style={styles.hintText}>{`Check API reachability: ${API_CONFIG.baseUrl}`}</Text>
              ) : null}

              {submitting ? (
                <View style={styles.loadingButton}>
                  <ActivityIndicator size="small" color={COLORS.goldGlow} />
                  <Text style={styles.loadingText}>Creating account...</Text>
                </View>
              ) : (
                <GoldButton label="Create account" onPress={onSubmit} />
              )}

              <View style={styles.linksRow}>
                <Pressable onPress={() => router.push('/(auth)/login')}>
                  <Text style={styles.linkText}>Already have an account? Sign in</Text>
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
  registerTitle: {
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
  labelSpacing: {
    marginTop: 12,
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
  termsRow: {
    marginTop: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  termsText: {
    flex: 1,
    color: COLORS.textBody,
    fontFamily: FONT.body,
    fontSize: 12,
    lineHeight: 17,
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
  statusBlock: {
    minHeight: 24,
    marginTop: 8,
    justifyContent: 'center',
  },
  errorText: {
    color: COLORS.danger,
    fontFamily: FONT.body,
    fontSize: 12,
  },
  successText: {
    color: COLORS.success,
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
    marginTop: 12,
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
    gap: 8,
  },
  linkText: {
    color: COLORS.textMuted,
    fontFamily: FONT.body,
    fontSize: 12,
    textDecorationLine: 'underline',
  },
});
