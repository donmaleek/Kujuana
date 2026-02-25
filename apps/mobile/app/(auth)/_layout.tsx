import { Redirect, Stack } from 'expo-router';
import { Screen } from '@/components/ui/Screen';
import { LoadingState } from '@/components/common/LoadingState';
import { useAuthStore } from '@/store/auth-store';

export default function AuthLayout() {
  const status = useAuthStore((state) => state.status);

  if (status === 'bootstrapping') {
    return (
      <Screen scroll={false}>
        <LoadingState label="Loading secure session..." />
      </Screen>
    );
  }

  if (status === 'signed_in') {
    return <Redirect href="/" />;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        gestureEnabled: true,
      }}
    />
  );
}
