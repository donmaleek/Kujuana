import { Redirect } from 'expo-router';
import { useSession } from '@/lib/state/session';

export default function IndexRoute() {
  const { status } = useSession();

  if (status === 'bootstrapping') return null;
  if (status === 'signed_in') return <Redirect href="/(tabs)" />;
  return <Redirect href="/(auth)/login" />;
}
