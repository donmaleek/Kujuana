import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

export default function LoginGatewayScreen() {
  return (
    <LinearGradient
      colors={['#140321', '#2A0B46', '#4B165E', '#2A0B46', '#140321']}
      start={{ x: 0.15, y: 0.1 }}
      end={{ x: 0.85, y: 0.95 }}
      style={styles.bg}
    >
      <View style={[styles.glow, styles.glowTopRight]} />
      <View style={[styles.glow, styles.glowBottomRight]} />
      <View style={[styles.glow, styles.glowBottomLeft]} />

      <View style={styles.container}>
        <View style={styles.phoneFrame}>
          <View style={styles.phoneNotch} />

          <View style={styles.logoWrap}>
            <View style={styles.logoStage}>
              <View style={styles.logoHalo} />
              <Image source={require('../../assets/kujuana_logo.png')} style={styles.logoImage} resizeMode="contain" />
            </View>
            <Text style={styles.brand}>KUJUANA</Text>
            <Text style={styles.topTag}>Dating with intention.</Text>
          </View>

          <View style={styles.cardOuter}>
            <LinearGradient
              colors={['rgba(255,255,255,0.14)', 'rgba(255,255,255,0.06)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.card}
            >
              <Text style={styles.title}>Welcome to Kujuana</Text>
              <Text style={styles.subtitle}>Choose how you want to connect</Text>

              <Pressable
                style={{ marginTop: 16 }}
                onPress={() => router.push('/(auth)/register')}
              >
                <LinearGradient
                  colors={['#FFE680', '#FFD700', '#D9A300']}
                  start={{ x: 0.1, y: 0.2 }}
                  end={{ x: 0.9, y: 0.8 }}
                  style={styles.primaryBtn}
                >
                  <Text style={styles.primaryBtnText}>Sign Up</Text>
                </LinearGradient>
              </Pressable>

              <Pressable
                style={{ marginTop: 12 }}
                onPress={() => router.push('/(auth)/sign-in')}
              >
                <View style={styles.secondaryBtn}>
                  <Text style={styles.secondaryBtnText}>Log In</Text>
                </View>
              </Pressable>

              <View style={styles.divider} />

              <TierCard
                title="VIP Matching"
                desc="Unlimited curated matches monthly"
                onPress={() => router.push({ pathname: '/(auth)/register', params: { tier: 'vip' } })}
              />
              <TierCard
                title="Priority Matching"
                desc="Instant single match"
                onPress={() => router.push({ pathname: '/(auth)/register', params: { tier: 'priority' } })}
              />
              <TierCard
                title="Standard Matching"
                desc="Free matching, takes time"
                onPress={() => router.push({ pathname: '/(auth)/register', params: { tier: 'standard' } })}
              />

              <View style={styles.bottomNav}>
                <NavItem icon="heart-outline" label="Matches" active />
                <NavItem icon="chatbubble-outline" label="Messages" />
                <NavItem icon="person-outline" label="Profile" />
                <NavItem icon="hand-left-outline" label="Matchmaker" />
              </View>

              <View style={styles.footerLinksRow}>
                <Text style={styles.footerLink}>Support</Text>
                <Text style={styles.footerDot}>•</Text>
                <Text style={styles.footerLink}>Kujuana Self-Matching</Text>
                <Text style={styles.footerDot}>•</Text>
                <Text style={styles.footerLink}>keithmuoki.com</Text>
              </View>
            </LinearGradient>
          </View>
        </View>
      </View>
    </LinearGradient>
  );
}

function TierCard({
  title,
  desc,
  onPress,
}: {
  title: string;
  desc: string;
  onPress: () => void;
}) {
  return (
    <Pressable style={{ marginTop: 12 }} onPress={onPress}>
      <View style={styles.tierOuter}>
        <LinearGradient
          colors={['rgba(217,179,95,0.75)', 'rgba(217,179,95,0.20)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.tierBorder}
        >
          <View style={styles.tierInner}>
            <View style={[styles.tierAccent, styles.tierAccentLeft]} />
            <View style={[styles.tierAccent, styles.tierAccentRight]} />

            <Text style={styles.tierTitle}>{title}</Text>
            <Text style={styles.tierDesc}>{desc}</Text>
          </View>
        </LinearGradient>
      </View>
    </Pressable>
  );
}

function NavItem({
  icon,
  label,
  active,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  active?: boolean;
}) {
  return (
    <View style={styles.navItem}>
      <Ionicons
        name={icon}
        size={20}
        color={active ? '#FFD700' : 'rgba(255,255,255,0.45)'}
      />
      <Text style={[styles.navLabel, active && { color: '#FFD700' }]}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1 },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 18,
    paddingVertical: 22,
  },
  glow: {
    position: 'absolute',
    width: 260,
    height: 260,
    borderRadius: 260,
    backgroundColor: 'rgba(233, 197, 108, 0.22)',
    opacity: 0.9,
    transform: [{ scale: 1.2 }],
  },
  glowTopRight: { top: -80, right: -120 },
  glowBottomRight: { bottom: -110, right: -130 },
  glowBottomLeft: { bottom: -150, left: -140, opacity: 0.55 },
  phoneFrame: {
    width: 340,
    maxWidth: '100%',
    borderRadius: 34,
    paddingTop: 34,
    paddingHorizontal: 20,
    paddingBottom: 18,
    backgroundColor: 'rgba(0,0,0,0.18)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
    shadowColor: '#000',
    shadowOpacity: 0.35,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8,
    overflow: 'hidden',
  },
  phoneNotch: {
    position: 'absolute',
    top: 10,
    alignSelf: 'center',
    width: 120,
    height: 26,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.60)',
  },
  logoWrap: { alignItems: 'center', marginTop: 6 },
  logoStage: {
    width: 228,
    height: 228,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoHalo: {
    position: 'absolute',
    width: 216,
    height: 216,
    borderRadius: 999,
    backgroundColor: 'rgba(255, 215, 0, 0.15)',
    shadowColor: '#FFD700',
    shadowOpacity: 0.48,
    shadowRadius: 30,
    shadowOffset: { width: 0, height: 0 },
  },
  logoImage: {
    width: 210,
    height: 210,
    shadowColor: 'rgba(255, 215, 0, 0.9)',
    shadowOpacity: 0.65,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 0 },
  },
  brand: {
    marginTop: 10,
    color: '#FFD700',
    fontSize: 19,
    fontWeight: '800',
    letterSpacing: 3,
    textShadowColor: 'rgba(255, 215, 0, 0.6)',
    textShadowRadius: 10,
  },
  topTag: {
    marginTop: 4,
    color: 'rgba(255,255,255,0.75)',
    fontSize: 13,
    textShadowColor: 'rgba(255, 215, 0, 0.45)',
    textShadowRadius: 8,
  },
  cardOuter: {
    marginTop: 14,
    borderRadius: 24,
    padding: 1.2,
    borderColor: 'rgba(230, 196, 106, 0.22)',
    borderWidth: 1,
    backgroundColor: 'rgba(255,255,255,0.02)',
  },
  card: {
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 14,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  title: {
    textAlign: 'center',
    color: 'rgba(255,255,255,0.92)',
    fontSize: 30,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  subtitle: {
    marginTop: 6,
    textAlign: 'center',
    color: 'rgba(255,255,255,0.70)',
    fontSize: 13.5,
  },
  primaryBtn: {
    height: 52,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryBtnText: {
    color: '#1C0C2A',
    fontSize: 16,
    fontWeight: '800',
  },
  secondaryBtn: {
    height: 52,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.10)',
    borderWidth: 1,
    borderColor: 'rgba(230, 196, 106, 0.55)',
  },
  secondaryBtnText: {
    color: '#FFD700',
    fontSize: 16,
    fontWeight: '800',
    textShadowColor: 'rgba(255, 215, 0, 0.45)',
    textShadowRadius: 7,
  },
  divider: {
    marginTop: 16,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.10)',
  },
  tierOuter: {
    borderRadius: 18,
    overflow: 'hidden',
  },
  tierBorder: {
    borderRadius: 18,
    padding: 1.2,
  },
  tierInner: {
    borderRadius: 17,
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(0,0,0,0.18)',
    alignItems: 'center',
    position: 'relative',
  },
  tierAccent: {
    position: 'absolute',
    top: '50%',
    width: 18,
    height: 34,
    marginTop: -17,
    borderRadius: 18,
    backgroundColor: 'rgba(230,196,106,0.55)',
    opacity: 0.75,
  },
  tierAccentLeft: { left: -9 },
  tierAccentRight: { right: -9 },
  tierTitle: {
    color: 'rgba(255,255,255,0.92)',
    fontSize: 22,
    fontWeight: '800',
  },
  tierDesc: {
    marginTop: 6,
    color: 'rgba(255,255,255,0.65)',
    fontSize: 12.5,
  },
  bottomNav: {
    marginTop: 14,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.10)',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  navItem: {
    width: '25%',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  navLabel: {
    fontSize: 11.5,
    color: 'rgba(255,255,255,0.45)',
  },
  footerLinksRow: {
    marginTop: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  footerLink: {
    color: 'rgba(255, 215, 0, 0.85)',
    fontSize: 11.5,
  },
  footerDot: {
    color: 'rgba(255,255,255,0.35)',
    fontSize: 12,
  },
});
