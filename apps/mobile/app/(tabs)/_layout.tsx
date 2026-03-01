import { Redirect, Tabs } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { ActivityIndicator, Platform, StyleSheet, View } from 'react-native';
import type { ComponentProps } from 'react';
import { COLORS, FONT, RADIUS } from '@/lib/theme/tokens';
import { useSession } from '@/lib/state/session';

type IconName = ComponentProps<typeof MaterialCommunityIcons>['name'];

function icon(name: IconName, color: string, focused: boolean) {
  return (
    <MaterialCommunityIcons
      name={name}
      size={focused ? 24 : 22}
      color={color}
      style={focused ? styles.focusedIcon : undefined}
    />
  );
}

function blurActiveElementOnWeb() {
  if (Platform.OS !== 'web') return;
  if (typeof document === 'undefined') return;
  const active = document.activeElement as HTMLElement | null;
  active?.blur?.();
}

function handleTabPress() {
  blurActiveElementOnWeb();
  Haptics.selectionAsync();
}

export default function TabsLayout() {
  const { status } = useSession();

  if (status === 'bootstrapping') {
    return (
      <View style={styles.loadingWrap}>
        <ActivityIndicator size="large" color={COLORS.goldPrimary} />
      </View>
    );
  }

  if (status !== 'signed_in') {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarHideOnKeyboard: true,
        tabBarActiveTintColor: COLORS.goldChampagne,
        tabBarInactiveTintColor: 'rgba(245, 230, 179, 0.56)',
        tabBarLabelStyle: {
          fontFamily: FONT.bodyMedium,
          fontSize: 11,
          marginBottom: 4,
          letterSpacing: 0.2,
        },
        tabBarStyle: {
          borderTopWidth: 1,
          borderTopColor: 'rgba(212, 175, 55, 0.22)',
          backgroundColor: 'rgba(24, 2, 31, 0.95)',
          height: 82,
          paddingTop: 8,
          paddingBottom: 8,
          position: 'absolute',
          left: 14,
          right: 14,
          bottom: 16,
          borderRadius: RADIUS.xl,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Overview',
          tabBarIcon: ({ color, focused }) => icon('view-dashboard-outline', color, focused),
        }}
        listeners={{
          tabPress: () => {
            handleTabPress();
          },
        }}
      />
      <Tabs.Screen
        name="matches"
        options={{
          title: 'Matches',
          tabBarIcon: ({ color, focused }) => icon('heart-multiple-outline', color, focused),
        }}
        listeners={{
          tabPress: () => {
            handleTabPress();
          },
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, focused }) => icon('account-circle-outline', color, focused),
        }}
        listeners={{
          tabPress: () => {
            handleTabPress();
          },
        }}
      />
      <Tabs.Screen
        name="subscription"
        options={{
          title: 'Plan',
          tabBarIcon: ({ color, focused }) => icon('crown-outline', color, focused),
        }}
        listeners={{
          tabPress: () => {
            handleTabPress();
          },
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, focused }) => icon('cog-outline', color, focused),
        }}
        listeners={{
          tabPress: () => {
            handleTabPress();
          },
        }}
      />
      <Tabs.Screen
        name="help"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="blog"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="safety"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="contact"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  loadingWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.purpleDeepest,
  },
  focusedIcon: {
    ...(Platform.OS === 'web'
      ? ({
          textShadow: '0px 0px 8px rgba(212, 175, 55, 0.35)',
        } as any)
      : {
          textShadowColor: 'rgba(212, 175, 55, 0.35)',
          textShadowRadius: 8,
        }),
  },
});
