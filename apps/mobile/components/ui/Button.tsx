import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '@/lib/config/theme';

interface ButtonProps {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
}

export function Button({ label, onPress, disabled, loading, variant = 'primary' }: ButtonProps) {
  const isInactive = disabled || loading;

  return (
    <Pressable
      accessibilityRole="button"
      disabled={isInactive}
      onPress={onPress}
      style={styles.pressable}
    >
      {({ pressed }) =>
        variant === 'ghost' ? (
          <LinearGradient
            colors={['rgba(255,255,255,0.12)', 'rgba(255,255,255,0.05)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[
              styles.base,
              styles.ghost,
              isInactive && styles.disabled,
              pressed && !isInactive && styles.pressed,
            ]}
          >
            {loading ? (
              <ActivityIndicator color={theme.colors.primary} />
            ) : (
              <Text style={[styles.text, styles.ghostText]}>{label}</Text>
            )}
          </LinearGradient>
        ) : (
          <LinearGradient
            colors={gradientByVariant[variant]}
            start={{ x: 0.08, y: 0.15 }}
            end={{ x: 0.92, y: 0.85 }}
            style={[
              styles.base,
              styles.gradientBase,
              variant === 'danger' && styles.danger,
              isInactive && styles.disabled,
              pressed && !isInactive && styles.pressed,
            ]}
          >
            {loading ? (
              <ActivityIndicator color={variant === 'secondary' ? '#F7F1E3' : '#1C102D'} />
            ) : (
              <Text style={[styles.text, styles[`${variant}Text`]]}>{label}</Text>
            )}
          </LinearGradient>
        )
      }
    </Pressable>
  );
}

const gradientByVariant = {
  primary: ['#FFE680', '#FFD700', '#D9A300'],
  secondary: ['#8662CF', '#6A45B7', '#8662CF'],
  danger: ['#F56F8B', '#D54B68', '#F56F8B'],
} as const;

const styles = StyleSheet.create({
  pressable: {
    borderRadius: theme.radius.md,
    overflow: 'hidden',
  },
  base: {
    minHeight: 52,
    borderRadius: theme.radius.md,
    paddingHorizontal: theme.spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  gradientBase: {
    borderColor: 'rgba(0,0,0,0.18)',
    shadowColor: theme.colors.primaryGlow,
    shadowOpacity: 0.35,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
  ghost: {
    borderColor: theme.colors.border,
  },
  danger: { borderColor: 'rgba(0,0,0,0.28)' },
  disabled: {
    opacity: 0.65,
  },
  pressed: {
    transform: [{ scale: 0.985 }],
  },
  text: {
    fontFamily: theme.font.sansBold,
    fontSize: 16,
  },
  primaryText: {
    color: '#1C102D',
  },
  secondaryText: {
    color: '#F7F1E3',
  },
  ghostText: {
    color: theme.colors.primary,
  },
  dangerText: {
    color: '#FFF2F5',
  },
});
