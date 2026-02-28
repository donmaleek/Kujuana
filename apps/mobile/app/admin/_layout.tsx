import { Redirect, Stack } from 'expo-router';
import { useAuthStore } from '@/store/auth-store';

export default function AdminLayout() {
  const status = useAuthStore((state) => state.status);
  const role = useAuthStore((state) => state.role);

  if (status === 'bootstrapping') {
    return null;
  }

  if (status === 'signed_out') {
    return <Redirect href="/(auth)/welcome" />;
  }

  if (role !== 'admin' && role !== 'manager' && role !== 'matchmaker') {
    return <Redirect href="/(tabs)/home" />;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
