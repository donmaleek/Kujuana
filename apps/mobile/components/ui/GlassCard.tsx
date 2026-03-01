import { ReactNode } from 'react';
import { Platform, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, GRADIENTS, RADIUS, SHADOWS } from '@/lib/theme/tokens';

type GlassCardProps = {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  highlighted?: boolean;
};

export function GlassCard({ children, style, highlighted = false }: GlassCardProps) {
  return (
    <LinearGradient colors={GRADIENTS.card} style={[styles.base, highlighted && styles.highlighted, style]}>
      <View style={styles.borderOverlay} />
      {children}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: RADIUS.xl,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.strokeSoft,
    overflow: 'hidden',
    ...(Platform.OS === 'web'
      ? ({
          boxShadow: '0px 14px 20px rgba(0, 0, 0, 0.35)',
        } as ViewStyle)
      : SHADOWS.card),
  },
  highlighted: {
    borderColor: COLORS.stroke,
    ...(Platform.OS === 'web'
      ? ({
          boxShadow: '0px 8px 18px rgba(212, 175, 55, 0.2)',
        } as ViewStyle)
      : SHADOWS.glow),
  },
  borderOverlay: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: 1,
    borderRadius: RADIUS.xl,
    borderColor: 'rgba(255,255,255,0.06)',
  },
});
