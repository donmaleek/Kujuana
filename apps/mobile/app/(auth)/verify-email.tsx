import { useMemo, useState } from 'react';
import { Image, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { verifyEmail } from '@/lib/api/endpoints';
import { ApiError } from '@/lib/api/types';
import { TextField } from '@/components/ui/TextField';
import { Button } from '@/components/ui/Button';
import { theme } from '@/lib/config/theme';

export default function VerifyEmailScreen() {
  const params = useLocalSearchParams<{ email?: string }>();
  const defaultEmail = useMemo(() => {
    if (Array.isArray(params.email)) return params.email[0] ?? '';
    return params.email ?? '';
  }, [params.email]);

  const [email, setEmail] = useState(defaultEmail);
  const [token, setToken] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit() {
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      const response = await verifyEmail({ email: email.trim().toLowerCase(), token: token.trim() });
      setSuccess(response.message);
    } catch (err) {
      if (err instanceof ApiError || err instanceof Error) {
        setError(err.message);
      } else {
        setError('Verification failed.');
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
        <ScrollView contentContainerStyle={styles.container} bounces={false}>
          <View style={styles.phoneFrame}>
            <View style={styles.phoneNotch} />
            <View style={styles.logoWrap}>
              <View style={styles.logoStage}>
                <View style={styles.logoHalo} />
                <Image source={require('../../assets/kujuana_logo.png')} style={styles.logoImage} resizeMode="contain" />
              </View>
              <Text style={styles.brand}>KUJUANA</Text>
              <Text style={styles.tagline}>Dating with intention.</Text>
            </View>
            <Text style={styles.title}>Verify your email</Text>
            <Text style={styles.subtitle}>Enter the token sent to your inbox. You can continue to login after verification.</Text>
            {error ? <Text style={styles.error}>{error}</Text> : null}
            {success ? <Text style={styles.success}>{success}</Text> : null}
            <View style={styles.cardOuter}>
              <View style={styles.card}>
                <TextField
                  label="Email"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
                <TextField label="Verification Token" value={token} onChangeText={setToken} autoCapitalize="none" />
                <Button label="Verify" onPress={submit} loading={loading} />
              </View>
            </View>
            <Text style={styles.footer}>Private. Verified. Secure.</Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
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
    alignSelf: 'center',
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
    width: 128,
    height: 128,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoHalo: {
    position: 'absolute',
    width: 116,
    height: 116,
    borderRadius: 999,
    backgroundColor: 'rgba(255, 215, 0, 0.15)',
    shadowColor: '#FFD700',
    shadowOpacity: 0.48,
    shadowRadius: 30,
    shadowOffset: { width: 0, height: 0 },
  },
  logoImage: {
    width: 110,
    height: 110,
    shadowColor: 'rgba(255, 215, 0, 0.9)',
    shadowOpacity: 0.65,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 0 },
  },
  brand: {
    marginTop: 10,
    color: '#FFD700',
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: 3,
    textShadowColor: 'rgba(255, 215, 0, 0.55)',
    textShadowRadius: 10,
  },
  tagline: {
    marginTop: 4,
    color: 'rgba(255,255,255,0.75)',
    fontSize: 13,
  },
  title: {
    marginTop: 18,
    marginBottom: 8,
    textAlign: 'center',
    color: '#FFD700',
    fontSize: 26,
    fontWeight: '800',
    textShadowColor: 'rgba(255, 215, 0, 0.55)',
    textShadowRadius: 10,
  },
  subtitle: {
    color: 'rgba(255,255,255,0.80)',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 10,
    fontFamily: theme.font.sans,
  },
  error: {
    color: '#f3b0b0',
    textAlign: 'center',
    marginBottom: 8,
    fontSize: 12,
  },
  success: {
    color: '#6EDBB0',
    textAlign: 'center',
    marginBottom: 8,
    fontSize: 13,
  },
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
    paddingBottom: 14,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  footer: {
    marginTop: 18,
    textAlign: 'center',
    color: 'rgba(255,255,255,0.60)',
    fontSize: 12,
  },
});
