import type { PropsWithChildren } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '@/lib/config/theme';
import { DeviceShell } from '@/components/common/DeviceShell';

interface ScreenProps extends PropsWithChildren {
  scroll?: boolean;
  contentContainerStyle?: object;
}

export function Screen({ children, scroll = true, contentContainerStyle }: ScreenProps) {
  const content = scroll ? (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={[styles.scrollContent, contentContainerStyle]}
      showsVerticalScrollIndicator={false}
    >
      {children}
    </ScrollView>
  ) : (
    <View style={[styles.staticContent, contentContainerStyle]}>{children}</View>
  );

  return (
    <LinearGradient
      colors={[
        theme.colors.canvasDeep,
        theme.colors.canvas,
        '#25103C',
        theme.colors.canvasStrong,
        theme.colors.canvasDeep,
      ]}
      style={styles.gradient}
    >
      <View style={[styles.glow, styles.glowTopRight]} />
      <View style={[styles.glow, styles.glowBottomLeft]} />
      <View style={[styles.glow, styles.glowBottomRight]} />
      <SafeAreaView style={styles.safeArea}>
        <DeviceShell>{content}</DeviceShell>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  glow: {
    position: 'absolute',
    width: 280,
    height: 280,
    borderRadius: 280,
    backgroundColor: 'rgba(227, 193, 111, 0.18)',
  },
  glowTopRight: {
    top: -110,
    right: -130,
  },
  glowBottomLeft: {
    bottom: -150,
    left: -140,
    opacity: 0.5,
  },
  glowBottomRight: {
    bottom: -180,
    right: -160,
    backgroundColor: 'rgba(125, 87, 201, 0.16)',
  },
  safeArea: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: theme.spacing.lg,
    paddingBottom: theme.spacing.xl * 2,
    gap: theme.spacing.md,
  },
  staticContent: {
    flex: 1,
    padding: theme.spacing.lg,
  },
});
