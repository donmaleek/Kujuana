import { Redirect, Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '@/lib/config/theme';
import { resolveOnboardingRoute } from '@/lib/utils/navigation';
import { useAuthStore } from '@/store/auth-store';

export default function TabsLayout() {
  const status = useAuthStore((state) => state.status);
  const profile = useAuthStore((state) => state.profile);

  if (status === 'signed_out') {
    return <Redirect href="/(auth)/welcome" />;
  }

  if (!profile?.onboardingComplete) {
    return <Redirect href={resolveOnboardingRoute(profile)} />;
  }

  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textMuted,
        tabBarStyle: {
          backgroundColor: theme.colors.canvasStrong,
          borderTopColor: theme.colors.border,
          height: 68,
          paddingBottom: 10,
          paddingTop: 6,
        },
        tabBarIcon: ({ color, size }) => {
          const iconName =
            route.name === 'home'
              ? 'compass-outline'
              : route.name === 'matches'
                ? 'heart-outline'
                : route.name === 'upgrade'
                  ? 'diamond-outline'
                  : route.name === 'profile'
                    ? 'person-outline'
                    : 'settings-outline';

          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tabs.Screen name="home" options={{ title: 'Home' }} />
      <Tabs.Screen name="matches" options={{ title: 'Matches' }} />
      <Tabs.Screen name="upgrade" options={{ title: 'Upgrade' }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile' }} />
      <Tabs.Screen name="settings" options={{ title: 'Settings' }} />
    </Tabs>
  );
}
