import { useMemo, useState } from 'react';
import { useLocalSearchParams } from 'expo-router';
import { Text } from 'react-native';
import { verifyEmail } from '@/lib/api/endpoints';
import { ApiError } from '@/lib/api/types';
import { Screen } from '@/components/ui/Screen';
import { SectionCard } from '@/components/ui/SectionCard';
import { TextField } from '@/components/ui/TextField';
import { Button } from '@/components/ui/Button';
import { ErrorBanner } from '@/components/common/ErrorBanner';

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
    <Screen>
      <SectionCard
        title="Verify your email"
        subtitle="Enter the token sent to your inbox. You can continue to login after verification."
      >
        {error ? <ErrorBanner message={error} /> : null}
        {success ? <Text style={styles.success}>{success}</Text> : null}
        <TextField
          label="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <TextField label="Verification Token" value={token} onChangeText={setToken} autoCapitalize="none" />
        <Button label="Verify" onPress={submit} loading={loading} />
      </SectionCard>
    </Screen>
  );
}

const styles = {
  success: {
    color: '#6EDBB0',
  },
} as const;
