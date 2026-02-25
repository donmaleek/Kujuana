import type { PropsWithChildren } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '@/lib/config/theme';

interface SectionCardProps extends PropsWithChildren {
  title: string;
  subtitle?: string;
}

export function SectionCard({ title, subtitle, children }: SectionCardProps) {
  return (
    <View style={styles.outer}>
      <LinearGradient
        colors={['rgba(227,193,111,0.72)', 'rgba(227,193,111,0.22)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.border}
      >
        <LinearGradient
          colors={['rgba(255,255,255,0.12)', 'rgba(255,255,255,0.05)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.card}
        >
          <Text style={styles.title}>{title}</Text>
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
          <View style={styles.content}>{children}</View>
        </LinearGradient>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    borderRadius: theme.radius.lg,
    overflow: 'hidden',
  },
  border: {
    borderRadius: theme.radius.lg,
    padding: 1.2,
  },
  card: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.lg - 1,
    padding: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  title: {
    fontFamily: theme.font.sansBold,
    color: theme.colors.primary,
    fontSize: 18,
    textShadowColor: theme.colors.primaryGlow,
    textShadowRadius: 8,
  },
  subtitle: {
    color: theme.colors.textMuted,
    fontFamily: theme.font.sans,
    fontSize: 14,
    lineHeight: 20,
  },
  content: {
    gap: theme.spacing.sm,
  },
});
