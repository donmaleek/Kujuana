import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { theme } from '@/lib/config/theme';

interface LoadingStateProps {
  label?: string;
}

export function LoadingState({ label = 'Loading...' }: LoadingStateProps) {
  return (
    <View style={styles.container}>
      <ActivityIndicator color={theme.colors.primary} size="large" />
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 24,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  label: {
    fontFamily: theme.font.sans,
    color: theme.colors.textMuted,
    letterSpacing: 0.3,
  },
});
