import { useState } from 'react';
import type { ComponentProps } from 'react';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { AppScreen } from '@/components/ui/AppScreen';
import { FadeIn } from '@/components/ui/FadeIn';
import { GlassCard } from '@/components/ui/GlassCard';
import { GoldButton } from '@/components/ui/GoldButton';
import { TabScreenHeader } from '@/components/ui/TabScreenHeader';
import { API_CONFIG } from '@/lib/api/config';
import { COLORS, FONT, RADIUS } from '@/lib/theme/tokens';

type IconName = ComponentProps<typeof MaterialCommunityIcons>['name'];

type SafetyTip = {
  id: string;
  title: string;
  detail: string;
  icon: IconName;
};

type SafetySection = {
  id: string;
  title: string;
  subtitle: string;
  tips: SafetyTip[];
};

const SAFETY_SECTIONS: SafetySection[] = [
  {
    id: 'before',
    title: 'Before the Date',
    subtitle: 'Set strong boundaries and reduce risk before meeting in person.',
    tips: [
      {
        id: 'before-1',
        title: 'Verify identity and intent',
        detail: 'Take time to evaluate consistency in communication before sharing personal details.',
        icon: 'account-check-outline',
      },
      {
        id: 'before-2',
        title: 'Keep early chats in-app',
        detail: 'Avoid moving to private channels too quickly so you retain moderation support.',
        icon: 'message-lock-outline',
      },
      {
        id: 'before-3',
        title: 'Never share financial credentials',
        detail: 'Do not send money, OTP codes, passwords, or bank details under any circumstance.',
        icon: 'cash-remove',
      },
    ],
  },
  {
    id: 'during',
    title: 'During the Date',
    subtitle: 'Stay in control of your environment and your own transport.',
    tips: [
      {
        id: 'during-1',
        title: 'Meet in a public place',
        detail: 'Choose busy venues and avoid isolated locations for first meetings.',
        icon: 'map-marker-radius-outline',
      },
      {
        id: 'during-2',
        title: 'Tell a trusted contact',
        detail: 'Share location, date time, and check-in plans with someone you trust.',
        icon: 'account-group-outline',
      },
      {
        id: 'during-3',
        title: 'Use your own transport',
        detail: 'Maintain independence to leave quickly if anything feels off.',
        icon: 'car-outline',
      },
    ],
  },
  {
    id: 'digital',
    title: 'Digital Safety',
    subtitle: 'Protect your account, location, and identity online.',
    tips: [
      {
        id: 'digital-1',
        title: 'Limit location precision',
        detail: 'Share your city, not exact addresses or daily routines.',
        icon: 'map-marker-off-outline',
      },
      {
        id: 'digital-2',
        title: 'Review privacy settings',
        detail: 'Use private mode if needed and update visibility as your comfort changes.',
        icon: 'shield-crown-outline',
      },
      {
        id: 'digital-3',
        title: 'Report suspicious behavior fast',
        detail: 'Capture screenshots and report immediately so moderation can act quickly.',
        icon: 'alert-circle-outline',
      },
    ],
  },
];

const RED_FLAGS = [
  'Pressure to move off-platform immediately',
  'Requests for money, gift cards, or emergency transfers',
  'Contradictory stories about work, location, or identity',
  'Attempts to isolate you from public meeting places',
  'Refusal to respect your boundaries or pace',
];

const SAFETY_CHECKLIST = [
  'I verified enough consistency before agreeing to meet.',
  'My first date venue is public and easy to exit.',
  'A trusted contact knows where I am and when.',
  'I will use my own transport to and from the date.',
  'I will report any suspicious behavior immediately.',
];

export default function SafetyScreen() {
  const router = useRouter();
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  async function openPath(path: '/contact' | '/privacy' | '/terms') {
    const url = `${API_CONFIG.webUrl}${path}`;
    try {
      await Linking.openURL(url);
      setActionMessage(null);
    } catch {
      setActionMessage(`Open in browser: ${url}`);
    }
  }

  return (
    <AppScreen>
      <FadeIn>
        <TabScreenHeader
          title="Safety Tips"
          subtitle="Date with confidence, boundaries, and practical protection at every stage."
        />
      </FadeIn>

      <FadeIn delay={100}>
        <GlassCard highlighted>
          <Text style={styles.heroTitle}>Safety Standard</Text>
          <Text style={styles.heroBody}>
            Kujuana is built for intentional relationships and private-first dating. Use these guardrails before, during,
            and after every introduction.
          </Text>
          <View style={styles.heroPills}>
            <Pill icon="shield-check-outline" label="Private by design" />
            <Pill icon="account-check-outline" label="Boundary-first" />
            <Pill icon="flash-outline" label="Fast reporting" />
          </View>
        </GlassCard>
      </FadeIn>

      {SAFETY_SECTIONS.map((section, index) => (
        <FadeIn key={section.id} delay={170 + index * 70}>
          <GlassCard>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <Text style={styles.sectionSubtitle}>{section.subtitle}</Text>
            <View style={styles.tipList}>
              {section.tips.map((tip) => (
                <View key={tip.id} style={styles.tipRow}>
                  <View style={styles.tipIconWrap}>
                    <MaterialCommunityIcons name={tip.icon} size={15} color={COLORS.goldChampagne} />
                  </View>
                  <View style={styles.tipBody}>
                    <Text style={styles.tipTitle}>{tip.title}</Text>
                    <Text style={styles.tipDetail}>{tip.detail}</Text>
                  </View>
                </View>
              ))}
            </View>
          </GlassCard>
        </FadeIn>
      ))}

      <FadeIn delay={380}>
        <GlassCard>
          <Text style={styles.sectionTitle}>Red Flags</Text>
          <Text style={styles.sectionSubtitle}>If you spot these patterns, pause and report immediately.</Text>
          <View style={styles.redFlagsWrap}>
            {RED_FLAGS.map((flag) => (
              <View key={flag} style={styles.flagItem}>
                <MaterialCommunityIcons name="alert" size={14} color={COLORS.danger} />
                <Text style={styles.flagText}>{flag}</Text>
              </View>
            ))}
          </View>
        </GlassCard>
      </FadeIn>

      <FadeIn delay={450}>
        <GlassCard highlighted>
          <Text style={styles.sectionTitle}>My Safety Checklist</Text>
          <Text style={styles.sectionSubtitle}>Complete this before every first date.</Text>
          <View style={styles.checklistWrap}>
            {SAFETY_CHECKLIST.map((item) => {
              const isChecked = Boolean(checked[item]);
              return (
                <Pressable
                  key={item}
                  onPress={() => setChecked((prev) => ({ ...prev, [item]: !prev[item] }))}
                  style={({ pressed }) => [styles.checkItem, pressed && styles.checkItemPressed]}
                >
                  <MaterialCommunityIcons
                    name={isChecked ? 'checkbox-marked-circle-outline' : 'checkbox-blank-circle-outline'}
                    size={19}
                    color={isChecked ? COLORS.success : COLORS.goldChampagne}
                  />
                  <Text style={styles.checkText}>{item}</Text>
                </Pressable>
              );
            })}
          </View>
        </GlassCard>
      </FadeIn>

      <FadeIn delay={520}>
        <GlassCard>
          <Text style={styles.sectionTitle}>Need urgent support?</Text>
          <Text style={styles.sectionSubtitle}>
            Include your email, a short incident summary, and screenshots. Add “Safety” in your subject for priority triage.
          </Text>
          <View style={styles.supportActions}>
            <GoldButton label="Contact Support" onPress={() => router.push('/(tabs)/contact')} style={styles.supportButton} />
            <GoldButton label="Privacy Policy" outlined onPress={() => void openPath('/privacy')} style={styles.supportButton} />
          </View>
          <View style={styles.supportActions}>
            <GoldButton label="Terms of Service" outlined onPress={() => void openPath('/terms')} style={styles.supportButton} />
          </View>
          {actionMessage ? <Text style={styles.actionMessage}>{actionMessage}</Text> : null}
        </GlassCard>
      </FadeIn>
    </AppScreen>
  );
}

function Pill({ icon, label }: { icon: IconName; label: string }) {
  return (
    <View style={styles.pill}>
      <MaterialCommunityIcons name={icon} size={13} color={COLORS.goldGlow} />
      <Text style={styles.pillText}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  heroTitle: {
    color: COLORS.offWhite,
    fontFamily: FONT.display,
    fontSize: 28,
  },
  heroBody: {
    marginTop: 4,
    color: COLORS.textMuted,
    fontFamily: FONT.body,
    fontSize: 13,
    lineHeight: 19,
  },
  heroPills: {
    marginTop: 12,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  pill: {
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
  pillText: {
    color: COLORS.goldGlow,
    fontFamily: FONT.bodyMedium,
    fontSize: 12,
  },
  sectionTitle: {
    color: COLORS.offWhite,
    fontFamily: FONT.display,
    fontSize: 24,
  },
  sectionSubtitle: {
    marginTop: 4,
    color: COLORS.textMuted,
    fontFamily: FONT.body,
    fontSize: 13,
    lineHeight: 19,
  },
  tipList: {
    marginTop: 12,
    gap: 10,
  },
  tipRow: {
    flexDirection: 'row',
    gap: 9,
    alignItems: 'flex-start',
  },
  tipIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.strokeSoft,
    backgroundColor: 'rgba(255,255,255,0.03)',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  tipBody: {
    flex: 1,
  },
  tipTitle: {
    color: COLORS.offWhite,
    fontFamily: FONT.bodySemiBold,
    fontSize: 14,
  },
  tipDetail: {
    marginTop: 2,
    color: COLORS.textBody,
    fontFamily: FONT.body,
    fontSize: 13,
    lineHeight: 18,
  },
  redFlagsWrap: {
    marginTop: 12,
    gap: 8,
  },
  flagItem: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  flagText: {
    flex: 1,
    color: COLORS.textBody,
    fontFamily: FONT.body,
    fontSize: 13,
    lineHeight: 18,
  },
  checklistWrap: {
    marginTop: 12,
    gap: 8,
  },
  checkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    borderWidth: 1,
    borderColor: COLORS.strokeSoft,
    borderRadius: RADIUS.md,
    backgroundColor: 'rgba(255,255,255,0.03)',
    paddingHorizontal: 11,
    paddingVertical: 10,
  },
  checkItemPressed: {
    opacity: 0.85,
  },
  checkText: {
    flex: 1,
    color: COLORS.offWhite,
    fontFamily: FONT.body,
    fontSize: 13,
    lineHeight: 18,
  },
  supportActions: {
    marginTop: 10,
    flexDirection: 'row',
    gap: 8,
  },
  supportButton: {
    flex: 1,
  },
  actionMessage: {
    marginTop: 10,
    color: COLORS.textMuted,
    fontFamily: FONT.body,
    fontSize: 12,
  },
});
