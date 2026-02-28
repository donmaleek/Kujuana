import { Image, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '@/lib/config/theme';

interface ProfileAvatarProps {
  photoUrl?: string;
  initials?: string;
  size?: number;
  tier?: 'standard' | 'priority' | 'vip' | string;
}

const TIER_COLORS: Record<string, [string, string]> = {
  vip: ['#FFE680', '#D9A300'],
  priority: ['#C084FC', '#7C3AED'],
  standard: ['#6EDBB0', '#059669'],
};

export function ProfileAvatar({ photoUrl, initials = '?', size = 64, tier }: ProfileAvatarProps) {
  const fontSize = size * 0.36;
  const badgeSize = size * 0.28;

  return (
    <View style={{ width: size, height: size }}>
      <LinearGradient
        colors={['rgba(255,215,0,0.6)', 'rgba(125,87,201,0.6)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.ring, { width: size, height: size, borderRadius: size / 2 }]}
      >
        <View
          style={[
            styles.inner,
            {
              width: size - 4,
              height: size - 4,
              borderRadius: (size - 4) / 2,
            },
          ]}
        >
          {photoUrl ? (
            <Image
              source={{ uri: photoUrl }}
              style={{ width: size - 4, height: size - 4, borderRadius: (size - 4) / 2 }}
              resizeMode="cover"
            />
          ) : (
            <Text style={[styles.initials, { fontSize }]}>{initials.toUpperCase().slice(0, 2)}</Text>
          )}
        </View>
      </LinearGradient>

      {tier && TIER_COLORS[tier] ? (
        <LinearGradient
          colors={TIER_COLORS[tier]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[
            styles.badge,
            {
              width: badgeSize,
              height: badgeSize,
              borderRadius: badgeSize / 2,
              bottom: 0,
              right: 0,
            },
          ]}
        >
          <Text style={[styles.badgeText, { fontSize: badgeSize * 0.42 }]}>
            {tier === 'vip' ? '★' : tier === 'priority' ? '◆' : '●'}
          </Text>
        </LinearGradient>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  ring: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  inner: {
    backgroundColor: theme.colors.canvasStrong,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  initials: {
    color: theme.colors.primary,
    fontFamily: theme.font.sansBold,
    letterSpacing: 1,
  },
  badge: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: theme.colors.canvasStrong,
  },
  badgeText: {
    color: '#1C102D',
    fontWeight: '900',
  },
});
