import { StyleSheet, Text, View } from 'react-native';
import { theme } from '@/lib/config/theme';

interface ErrorBannerProps {
  message: string;
}

export function ErrorBanner({ message }: ErrorBannerProps) {
  return (
    <View style={styles.wrapper}>
      <Text style={styles.text}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    borderWidth: 1,
    borderColor: 'rgba(255,143,163,0.45)',
    backgroundColor: theme.colors.errorSurface,
    borderRadius: 12,
    padding: 12,
  },
  text: {
    color: theme.colors.error,
    fontFamily: theme.font.sans,
    fontSize: 13,
  },
});
