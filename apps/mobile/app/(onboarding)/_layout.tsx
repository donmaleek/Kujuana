import { Redirect, Stack } from 'expo-router';
import { Screen } from '@/components/ui/Screen';
import { LoadingState } from '@/components/common/LoadingState';
import { useAuthStore } from '@/store/auth-store';

export default function OnboardingLayout() {
  const status = useAuthStore((state) => state.status);
  const profileLoading = useAuthStore((state) => state.profileLoading);
  const profile = useAuthStore((state) => state.profile);

  if (status === 'bootstrapping' || profileLoading) {
    return (
      <Screen scroll={false}>
        <LoadingState label="Preparing onboarding..." />
      </Screen>
    );
  }

  if (status === 'signed_out') {
    return <Redirect href="/(auth)/welcome" />;
  }

  if (profile?.onboardingComplete) {
    return <Redirect href="/(tabs)/home" />;
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
