import { Image, StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { COLORS, FONT } from '@/lib/theme/tokens';

type KujuanaLogoProps = {
  size?: number;
  showWordmark?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function KujuanaLogo({ size = 42, showWordmark = true, style }: KujuanaLogoProps) {
  const width = Math.round(size * 0.97);

  return (
    <View style={[styles.row, style]}>
      <Image
        source={require('../../assets/icon.png')}
        style={{ width, height: size }}
        resizeMode="contain"
      />
      {showWordmark ? <Text style={styles.wordmark}>Kujuana</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  wordmark: {
    color: COLORS.goldChampagne,
    fontFamily: FONT.display,
    fontSize: 28,
    letterSpacing: 1.1,
  },
});
