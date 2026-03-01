import { MaterialCommunityIcons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import { COLORS, FONT, RADIUS } from '@/lib/theme/tokens';
import { KujuanaLogo } from '@/components/ui/KujuanaLogo';

type TabScreenHeaderProps = {
  title: string;
  subtitle: string;
};

const TRUST_PILLS = [
  { id: 'private', label: 'Private', icon: 'shield-check-outline' },
  { id: 'intentional', label: 'Intentional', icon: 'heart-outline' },
  { id: 'premium', label: 'Premium', icon: 'crown-outline' },
] as const;

export function TabScreenHeader({ title, subtitle }: TabScreenHeaderProps) {
  return (
    <View style={styles.wrap}>
      <View style={styles.brandWrap}>
        <KujuanaLogo size={58} showWordmark={false} style={styles.brandLogo} />
        <Text style={styles.brandName}>Kujuana</Text>
        <Text style={styles.brandCaption}>Dating With Intention</Text>
      </View>

      <View style={styles.trustRow}>
        {TRUST_PILLS.map((pill) => (
          <View key={pill.id} style={styles.trustPill}>
            <MaterialCommunityIcons name={pill.icon} size={13} color={COLORS.goldGlow} />
            <Text style={styles.trustText}>{pill.label}</Text>
          </View>
        ))}
      </View>

      <View style={styles.titleBlock}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    gap: 6,
  },
  brandWrap: {
    alignItems: 'center',
    gap: 2,
  },
  brandLogo: {
    justifyContent: 'center',
  },
  brandName: {
    color: COLORS.goldChampagne,
    fontFamily: FONT.display,
    fontSize: 42,
    letterSpacing: 0.8,
  },
  brandCaption: {
    color: COLORS.goldGlow,
    fontFamily: FONT.bodySemiBold,
    fontSize: 16,
    letterSpacing: 0.5,
  },
  trustRow: {
    marginTop: 6,
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  trustPill: {
    borderRadius: RADIUS.pill,
    borderWidth: 1,
    borderColor: COLORS.stroke,
    backgroundColor: 'rgba(24,2,31,0.52)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  trustText: {
    color: COLORS.goldGlow,
    fontFamily: FONT.bodyMedium,
    fontSize: 12,
    letterSpacing: 0.3,
  },
  titleBlock: {
    marginTop: 6,
    alignItems: 'center',
    maxWidth: 440,
  },
  title: {
    color: COLORS.offWhite,
    fontFamily: FONT.displayBold,
    fontSize: 34,
    lineHeight: 36,
    textAlign: 'center',
  },
  subtitle: {
    marginTop: 2,
    color: COLORS.textMuted,
    fontFamily: FONT.body,
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
});
