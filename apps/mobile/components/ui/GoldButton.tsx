import { Pressable, StyleProp, StyleSheet, Text, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, FONT, GRADIENTS, RADIUS } from '@/lib/theme/tokens';

type GoldButtonProps = {
  label: string;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  outlined?: boolean;
};

export function GoldButton({ label, onPress, style, outlined = false }: GoldButtonProps) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.wrap, pressed && styles.pressed, style]}>
      {outlined ? (
        <LinearGradient colors={['rgba(212,175,55,0.10)', 'rgba(212,175,55,0.04)']} style={styles.innerOutlined}>
          <Text style={styles.textOutlined}>{label}</Text>
        </LinearGradient>
      ) : (
        <LinearGradient colors={GRADIENTS.gold} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.innerFill}>
          <Text style={styles.textFill}>{label}</Text>
        </LinearGradient>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderRadius: RADIUS.pill,
    overflow: 'hidden',
  },
  pressed: {
    opacity: 0.88,
    transform: [{ scale: 0.995 }],
  },
  innerFill: {
    paddingVertical: 13,
    paddingHorizontal: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  innerOutlined: {
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderWidth: 1,
    borderColor: COLORS.goldPrimary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textFill: {
    color: COLORS.purpleDeepest,
    fontFamily: FONT.bodySemiBold,
    letterSpacing: 0.8,
    fontSize: 12,
    textTransform: 'uppercase',
  },
  textOutlined: {
    color: COLORS.goldChampagne,
    fontFamily: FONT.bodySemiBold,
    letterSpacing: 0.8,
    fontSize: 12,
    textTransform: 'uppercase',
  },
});
