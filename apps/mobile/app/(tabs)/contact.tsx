import { useState } from 'react';
import type { ComponentProps } from 'react';
import { Linking, StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AppScreen } from '@/components/ui/AppScreen';
import { FadeIn } from '@/components/ui/FadeIn';
import { GlassCard } from '@/components/ui/GlassCard';
import { GoldButton } from '@/components/ui/GoldButton';
import { TabScreenHeader } from '@/components/ui/TabScreenHeader';
import { API_CONFIG } from '@/lib/api/config';
import { COLORS, FONT, RADIUS } from '@/lib/theme/tokens';

type IconName = ComponentProps<typeof MaterialCommunityIcons>['name'];

type ContactChannel = {
  id: string;
  title: string;
  subtitle: string;
  response: string;
  icon: IconName;
  actionLabel: string;
  onPress: () => void;
};

const SUPPORT_EMAIL = 'support@kujuana.com';
const PARTNERSHIPS_EMAIL = 'partnerships@kujuana.com';

function encodeMailtoValue(value: string) {
  return encodeURIComponent(value);
}

export default function ContactScreen() {
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  async function openUrl(url: string, fallbackLabel: string) {
    try {
      await Linking.openURL(url);
      setActionMessage(null);
    } catch {
      setActionMessage(fallbackLabel);
    }
  }

  function supportMailto(subject: string, body: string) {
    const url = `mailto:${SUPPORT_EMAIL}?subject=${encodeMailtoValue(subject)}&body=${encodeMailtoValue(body)}`;
    return openUrl(url, `Email support: ${SUPPORT_EMAIL}`);
  }

  const channels: ContactChannel[] = [
    {
      id: 'support',
      title: 'General Support',
      subtitle: 'Account access, profile updates, and technical troubleshooting.',
      response: 'Typical response: within 24 hours',
      icon: 'lifebuoy',
      actionLabel: 'Email support',
      onPress: () =>
        void supportMailto(
          'Kujuana Support Request',
          'Hi Kujuana team,\n\nI need help with:\n\nAccount email:\nDevice:\nIssue details:\n\nThanks.'
        ),
    },
    {
      id: 'safety',
      title: 'Safety Priority',
      subtitle: 'Urgent incidents, harassment, fraud attempts, or unsafe behavior.',
      response: 'Priority triage: fastest available review',
      icon: 'shield-alert-outline',
      actionLabel: 'Report safety issue',
      onPress: () =>
        void supportMailto(
          'SAFETY - Priority Review Needed',
          'Hi Kujuana Safety Team,\n\nPlease review this urgent incident.\n\nAccount email:\nDate/time:\nMember involved:\nSummary:\nEvidence attached:\n\nThank you.'
        ),
    },
    {
      id: 'billing',
      title: 'Billing & Subscription',
      subtitle: 'Tier changes, credits, renewals, and payment troubleshooting.',
      response: 'Typical response: within 24 hours',
      icon: 'credit-card-outline',
      actionLabel: 'Contact billing',
      onPress: () =>
        void supportMailto(
          'Billing Support Request',
          'Hi Kujuana Billing Team,\n\nI need help with billing/subscription.\n\nAccount email:\nCurrent plan:\nIssue details:\n\nThanks.'
        ),
    },
    {
      id: 'partnerships',
      title: 'Partnerships & Media',
      subtitle: 'Brand collaborations, media, and strategic partnerships.',
      response: 'Typical response: within 2 business days',
      icon: 'handshake-outline',
      actionLabel: 'Email partnerships',
      onPress: () =>
        void openUrl(
          `mailto:${PARTNERSHIPS_EMAIL}?subject=${encodeMailtoValue('Partnership Inquiry')}`,
          `Email partnerships: ${PARTNERSHIPS_EMAIL}`
        ),
    },
  ];

  return (
    <AppScreen>
      <FadeIn>
        <TabScreenHeader
          title="Contact Us"
          subtitle="Premium support channels for account, safety, billing, and partnerships."
        />
      </FadeIn>

      <FadeIn delay={100}>
        <GlassCard highlighted>
          <Text style={styles.heroTitle}>We’re here to help</Text>
          <Text style={styles.heroBody}>
            Share clear context, your account email, and any screenshots. We’ll route your request to the right team for
            faster resolution.
          </Text>
          <View style={styles.heroPills}>
            <Pill icon="clock-fast" label="Fast triage" />
            <Pill icon="shield-check-outline" label="Privacy-first" />
            <Pill icon="account-voice" label="Human support" />
          </View>
        </GlassCard>
      </FadeIn>

      <FadeIn delay={170}>
        <Text style={styles.sectionTitle}>Support channels</Text>
        <View style={styles.channelList}>
          {channels.map((channel) => (
            <GlassCard key={channel.id} style={styles.channelCard}>
              <View style={styles.channelHead}>
                <View style={styles.channelIconWrap}>
                  <MaterialCommunityIcons name={channel.icon} size={16} color={COLORS.goldChampagne} />
                </View>
                <View style={styles.channelBody}>
                  <Text style={styles.channelTitle}>{channel.title}</Text>
                  <Text style={styles.channelSubtitle}>{channel.subtitle}</Text>
                  <Text style={styles.channelResponse}>{channel.response}</Text>
                </View>
              </View>
              <GoldButton label={channel.actionLabel} onPress={channel.onPress} />
            </GlassCard>
          ))}
        </View>
      </FadeIn>

      <FadeIn delay={240}>
        <GlassCard>
          <Text style={styles.sectionTitle}>Before you contact us</Text>
          <View style={styles.prepList}>
            {[
              'Include your Kujuana account email.',
              'Share exact error text if available.',
              'Add device/browser details and timezone.',
              'Attach screenshots for faster diagnosis.',
            ].map((line) => (
              <View key={line} style={styles.prepItem}>
                <MaterialCommunityIcons name="check-circle-outline" size={15} color={COLORS.success} />
                <Text style={styles.prepText}>{line}</Text>
              </View>
            ))}
          </View>
          <View style={styles.webActions}>
            <GoldButton
              label="Open Web Contact Page"
              outlined
              onPress={() => void openUrl(`${API_CONFIG.webUrl}/contact`, `Open in browser: ${API_CONFIG.webUrl}/contact`)}
            />
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
  channelList: {
    gap: 10,
  },
  channelCard: {
    gap: 12,
  },
  channelHead: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 9,
  },
  channelIconWrap: {
    width: 29,
    height: 29,
    borderRadius: 14.5,
    borderWidth: 1,
    borderColor: COLORS.strokeSoft,
    backgroundColor: 'rgba(255,255,255,0.03)',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  channelBody: {
    flex: 1,
  },
  channelTitle: {
    color: COLORS.offWhite,
    fontFamily: FONT.bodySemiBold,
    fontSize: 15,
  },
  channelSubtitle: {
    marginTop: 2,
    color: COLORS.textBody,
    fontFamily: FONT.body,
    fontSize: 13,
    lineHeight: 18,
  },
  channelResponse: {
    marginTop: 6,
    color: COLORS.goldChampagne,
    fontFamily: FONT.bodyMedium,
    fontSize: 12,
  },
  prepList: {
    marginTop: 10,
    gap: 8,
  },
  prepItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  prepText: {
    flex: 1,
    color: COLORS.textBody,
    fontFamily: FONT.body,
    fontSize: 13,
    lineHeight: 18,
  },
  webActions: {
    marginTop: 12,
  },
  actionMessage: {
    marginTop: 10,
    color: COLORS.textMuted,
    fontFamily: FONT.body,
    fontSize: 12,
  },
});
