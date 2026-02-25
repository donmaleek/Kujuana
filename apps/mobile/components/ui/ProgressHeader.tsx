import { StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '@/lib/config/theme';

interface ProgressHeaderProps {
  step: number;
  total: number;
  title: string;
  subtitle: string;
}

export function ProgressHeader({ step, total, title, subtitle }: ProgressHeaderProps) {
  const progressWidth = `${Math.min((step / total) * 100, 100)}%` as const;

  return (
    <View style={styles.wrapper}>
      <Text style={styles.kicker}>Step {step} of {total}</Text>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
      <View style={styles.track}>
        <LinearGradient
          colors={['#FFE680', '#FFD700', '#D9A300']}
          start={{ x: 0.1, y: 0.2 }}
          end={{ x: 0.9, y: 0.8 }}
          style={[styles.fill, { width: progressWidth }]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: 8,
    marginBottom: theme.spacing.sm,
  },
  kicker: {
    fontSize: 12,
    color: theme.colors.primary,
    fontFamily: theme.font.sans,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  title: {
    fontFamily: theme.font.serif,
    fontSize: 30,
    color: theme.colors.primary,
    textShadowColor: theme.colors.primaryGlow,
    textShadowRadius: 10,
  },
  subtitle: {
    color: theme.colors.textMuted,
    fontFamily: theme.font.sans,
    fontSize: 15,
    lineHeight: 22,
  },
  track: {
    marginTop: 4,
    height: 10,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.12)',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(227,193,111,0.24)',
  },
  fill: {
    height: '100%',
    borderRadius: 999,
  },
});
