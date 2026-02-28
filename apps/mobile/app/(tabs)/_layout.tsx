import { Redirect, Tabs } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '@/lib/config/theme';
import { resolveOnboardingRoute } from '@/lib/utils/navigation';
import { useAuthStore } from '@/store/auth-store';

type IconName = keyof typeof Ionicons.glyphMap;

const TAB_CONFIG: Record<string, { label: string; icon: IconName; activeIcon: IconName }> = {
  home: {
    label: 'Discover',
    icon: 'compass-outline',
    activeIcon: 'compass',
  },
  matches: {
    label: 'Matches',
    icon: 'heart-outline',
    activeIcon: 'heart',
  },
  upgrade: {
    label: 'Upgrade',
    icon: 'diamond-outline',
    activeIcon: 'diamond',
  },
  profile: {
    label: 'Profile',
    icon: 'person-outline',
    activeIcon: 'person',
  },
  settings: {
    label: 'Settings',
    icon: 'settings-outline',
    activeIcon: 'settings',
  },
};

function TabBarIcon({
  routeName,
  focused,
  color,
}: {
  routeName: string;
  focused: boolean;
  color: string;
}) {
  const config = TAB_CONFIG[routeName];
  const iconName = config ? (focused ? config.activeIcon : config.icon) : 'ellipse-outline';
  const isUpgrade = routeName === 'upgrade';

  if (isUpgrade) {
    return (
      <LinearGradient
        colors={focused ? ['#FFE680', '#FFD700', '#D9A300'] : ['rgba(255,215,0,0.22)', 'rgba(255,215,0,0.10)']}
        start={{ x: 0.1, y: 0.1 }}
        end={{ x: 0.9, y: 0.9 }}
        style={styles.upgradePill}
      >
        <Ionicons name={iconName} size={18} color={focused ? '#1C102D' : theme.colors.primary} />
      </LinearGradient>
    );
  }

  return (
    <View style={styles.iconWrap}>
      {focused && <View style={styles.activeDot} />}
      <Ionicons name={iconName} size={22} color={color} />
    </View>
  );
}

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
        tabBarInactiveTintColor: 'rgba(184,169,205,0.65)',
        tabBarStyle: {
          backgroundColor: theme.colors.canvasStrong,
          borderTopColor: 'rgba(255,215,0,0.15)',
          borderTopWidth: 1,
          height: 72,
          paddingBottom: 10,
          paddingTop: 6,
          elevation: 20,
          shadowColor: '#FFD700',
          shadowOpacity: 0.08,
          shadowRadius: 12,
          shadowOffset: { width: 0, height: -4 },
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontFamily: theme.font.sansBold,
          letterSpacing: 0.3,
          marginTop: 2,
        },
        tabBarIcon: ({ focused, color }) => (
          <TabBarIcon routeName={route.name} focused={focused} color={color} />
        ),
      })}
    >
      <Tabs.Screen name="home" options={{ title: TAB_CONFIG.home.label }} />
      <Tabs.Screen name="matches" options={{ title: TAB_CONFIG.matches.label }} />
      <Tabs.Screen name="upgrade" options={{ title: TAB_CONFIG.upgrade.label }} />
      <Tabs.Screen name="profile" options={{ title: TAB_CONFIG.profile.label }} />
      <Tabs.Screen name="settings" options={{ title: TAB_CONFIG.settings.label }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  iconWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  activeDot: {
    position: 'absolute',
    top: -6,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: theme.colors.primary,
  },
  upgradePill: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -8,
    shadowColor: theme.colors.primary,
    shadowOpacity: 0.4,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 6,
  },
});
