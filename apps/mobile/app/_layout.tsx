import { useEffect } from 'react';
import { Stack, usePathname } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, LogBox, Platform, StyleSheet, Text, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useFonts } from 'expo-font';
import {
  Jost_300Light,
  Jost_400Regular,
  Jost_500Medium,
  Jost_600SemiBold,
} from '@expo-google-fonts/jost';
import { CormorantGaramond_600SemiBold, CormorantGaramond_700Bold } from '@expo-google-fonts/cormorant-garamond';
import { COLORS, FONT } from '@/lib/theme/tokens';
import { SessionProvider } from '@/lib/state/session';
import { AppDataProvider } from '@/lib/state/app-data';
import { KujuanaLogo } from '@/components/ui/KujuanaLogo';

const SUPPRESSED_WEB_WARNINGS = [
  'props.pointerEvents is deprecated. Use style.pointerEvents',
  'Blocked aria-hidden on an element because its descendant retained focus.',
] as const;

export default function RootLayout() {
  const pathname = usePathname();
  const [fontsLoaded] = useFonts({
    Jost_300Light,
    Jost_400Regular,
    Jost_500Medium,
    Jost_600SemiBold,
    CormorantGaramond_600SemiBold,
    CormorantGaramond_700Bold,
  });

  useEffect(() => {
    LogBox.ignoreLogs([
      'props.pointerEvents is deprecated. Use style.pointerEvents',
    ]);

    if (Platform.OS !== 'web') return;

    type ConsoleMethod = (...data: unknown[]) => void;
    type ConsoleWithFilterFlag = Console & { __kujuanaFilterInstalled?: boolean };

    const consoleWithFlag = console as ConsoleWithFilterFlag;
    if (consoleWithFlag.__kujuanaFilterInstalled) return;

    const shouldSuppress = (args: unknown[]) => {
      const text = args.map((item) => String(item)).join(' ');
      return SUPPRESSED_WEB_WARNINGS.some((warning) => text.includes(warning));
    };

    const originalWarn = console.warn.bind(console) as ConsoleMethod;
    const originalError = console.error.bind(console) as ConsoleMethod;

    console.warn = (...args: unknown[]) => {
      if (shouldSuppress(args)) return;
      originalWarn(...args);
    };

    console.error = (...args: unknown[]) => {
      if (shouldSuppress(args)) return;
      originalError(...args);
    };

    consoleWithFlag.__kujuanaFilterInstalled = true;
  }, []);

  useEffect(() => {
    if (Platform.OS !== 'web') return;
    if (typeof document === 'undefined') return;
    const activeElement = document.activeElement as HTMLElement | null;
    if (!activeElement || activeElement === document.body) return;
    activeElement.blur();
  }, [pathname]);

  if (!fontsLoaded) {
    return (
      <SafeAreaProvider>
        <View style={styles.loadingRoot}>
          <KujuanaLogo size={52} showWordmark={false} />
          <ActivityIndicator size="large" color={COLORS.goldPrimary} />
          <Text style={styles.loadingText}>Loading Kujuana</Text>
        </View>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <SessionProvider>
        <AppDataProvider>
          <StatusBar style="light" />
          <Stack screenOptions={{ headerShown: false, animation: Platform.OS === 'web' ? 'none' : 'fade' }}>
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="(tabs)" />
          </Stack>
        </AppDataProvider>
      </SessionProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loadingRoot: {
    flex: 1,
    backgroundColor: COLORS.purpleDeepest,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  loadingText: {
    fontFamily: FONT.bodyMedium,
    color: COLORS.goldChampagne,
    letterSpacing: 0.4,
  },
});
