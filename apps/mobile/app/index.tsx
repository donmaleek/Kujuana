import { Redirect } from 'expo-router';
import { Screen } from '@/components/ui/Screen';
import { LoadingState } from '@/components/common/LoadingState';
import { useAuthStore } from '@/store/auth-store';
import { resolveOnboardingRoute } from '@/lib/utils/navigation';

export default function IndexRoute() {
  const status = useAuthStore((state) => state.status);
  const profile = useAuthStore((state) => state.profile);
  const profileLoading = useAuthStore((state) => state.profileLoading);

  if (status === 'bootstrapping' || profileLoading) {
    return (
      <Screen scroll={false}>
        <LoadingState label="Preparing Kujuana..." />
      </Screen>
    );
  }

  if (status === 'signed_out') {
    return <Redirect href="/(auth)/welcome" />;
  }

  if (profile?.onboardingComplete) {
    return <Redirect href="/(tabs)/home" />;
  }

  return <Redirect href={resolveOnboardingRoute(profile)} />;
}
