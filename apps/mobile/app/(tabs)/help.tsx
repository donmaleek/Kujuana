import { useMemo, useState } from 'react';
import type { ComponentProps } from 'react';
import { Linking, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
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

type HelpAction = {
  id: string;
  title: string;
  description: string;
  icon: IconName;
  onPress: () => void;
};

type HelpFaq = {
  id: string;
  question: string;
  answer: string;
  tags: string[];
};

const FAQS: HelpFaq[] = [
  {
    id: 'login',
    question: 'I cannot sign in. What should I check first?',
    answer:
      'Confirm your email and password, then check that your app can reach the API endpoint. If your password is incorrect, reset it from the web login flow.',
    tags: ['login', 'password', 'account'],
  },
  {
    id: 'profile',
    question: 'How do I improve my match quality?',
    answer:
      'Complete your profile with clear values, detailed bio, and relationship vision. Respond to intros quickly and keep your preferences current.',
    tags: ['profile', 'matches', 'quality'],
  },
  {
    id: 'subscription',
    question: 'Where do I manage my subscription and credits?',
    answer:
      'Open Subscription from the tab bar or settings to view your tier, renewal timeline, and available credits. Upgrade actions open secure web checkout.',
    tags: ['subscription', 'billing', 'credits'],
  },
  {
    id: 'safety',
    question: 'How can I date safely on Kujuana?',
    answer:
      'Use in-app communication first, meet in public places, and share plans with trusted contacts. If something feels wrong, pause and report immediately.',
    tags: ['safety', 'report', 'trust'],
  },
  {
    id: 'privacy',
    question: 'How is my personal data protected?',
    answer:
      'Kujuana is privacy-first. Review Privacy Policy and Cookie Policy for collection, storage, and control options. You can update profile visibility from settings.',
    tags: ['privacy', 'data', 'policy'],
  },
];

export default function HelpScreen() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [openFaqId, setOpenFaqId] = useState<string | null>(FAQS[0]?.id ?? null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  async function openPath(path: string) {
    const url = `${API_CONFIG.webUrl}${path}`;
    try {
      await Linking.openURL(url);
      setActionMessage(null);
    } catch {
      setActionMessage(`Open in browser: ${url}`);
    }
  }

  const quickActions: HelpAction[] = [
    {
      id: 'contact',
      title: 'Contact Support',
      description: 'Get direct help with billing, account, or technical issues.',
      icon: 'lifebuoy',
      onPress: () => router.push('/(tabs)/contact'),
    },
    {
      id: 'safety',
      title: 'Safety Tips',
      description: 'Read best-practice guidance before and during every date.',
      icon: 'shield-check-outline',
      onPress: () => router.push('/(tabs)/safety'),
    },
    {
      id: 'blog',
      title: 'Dating Insights',
      description: 'Learn intentional dating strategies from Kujuana experts.',
      icon: 'newspaper-variant-outline',
      onPress: () => router.push('/(tabs)/blog'),
    },
    {
      id: 'subscription',
      title: 'Manage Plan',
      description: 'Open subscription settings and review your active tier.',
      icon: 'crown-outline',
      onPress: () => router.push('/(tabs)/subscription'),
    },
  ];

  const normalizedQuery = query.trim().toLowerCase();
  const filteredFaqs = useMemo(() => {
    if (!normalizedQuery) return FAQS;
    return FAQS.filter((faq) => {
      const searchable = `${faq.question} ${faq.answer} ${faq.tags.join(' ')}`.toLowerCase();
      return searchable.includes(normalizedQuery);
    });
  }, [normalizedQuery]);

  return (
    <AppScreen>
      <FadeIn>
        <TabScreenHeader
          title="Help Centre"
          subtitle="Fast answers, trusted guidance, and premium support whenever you need it."
        />
      </FadeIn>

      <FadeIn delay={100}>
        <GlassCard highlighted>
          <View style={styles.searchWrap}>
            <MaterialCommunityIcons name="magnify" size={18} color={COLORS.textMuted} />
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="Search help articles, billing, profile, safety..."
              placeholderTextColor="rgba(196,168,130,0.70)"
              style={styles.searchInput}
            />
          </View>
          <Text style={styles.searchMeta}>{`${filteredFaqs.length} result${filteredFaqs.length === 1 ? '' : 's'} found`}</Text>
        </GlassCard>
      </FadeIn>

      <FadeIn delay={170}>
        <Text style={styles.sectionTitle}>Quick actions</Text>
        <View style={styles.actionGrid}>
          {quickActions.map((action) => (
            <Pressable
              key={action.id}
              style={({ pressed }) => [styles.actionCard, pressed && styles.actionCardPressed]}
              onPress={action.onPress}
            >
              <View style={styles.actionIconWrap}>
                <MaterialCommunityIcons name={action.icon} size={17} color={COLORS.goldChampagne} />
              </View>
              <Text style={styles.actionTitle}>{action.title}</Text>
              <Text style={styles.actionDescription}>{action.description}</Text>
              <View style={styles.actionCta}>
                <Text style={styles.actionCtaText}>Open</Text>
                <MaterialCommunityIcons name="chevron-right" size={15} color={COLORS.goldChampagne} />
              </View>
            </Pressable>
          ))}
        </View>
      </FadeIn>

      <FadeIn delay={240}>
        <Text style={styles.sectionTitle}>Popular questions</Text>
        {filteredFaqs.length === 0 ? (
          <GlassCard>
            <Text style={styles.emptyTitle}>No matching articles</Text>
            <Text style={styles.emptyBody}>Try simpler keywords like login, billing, subscription, privacy, or safety.</Text>
          </GlassCard>
        ) : (
          filteredFaqs.map((faq) => {
            const open = openFaqId === faq.id;
            return (
              <GlassCard key={faq.id} style={styles.faqCard}>
                <Pressable onPress={() => setOpenFaqId((current) => (current === faq.id ? null : faq.id))} style={({ pressed }) => [styles.faqHead, pressed && styles.faqHeadPressed]}>
                  <Text style={styles.faqQuestion}>{faq.question}</Text>
                  <MaterialCommunityIcons
                    name={open ? 'chevron-up' : 'chevron-down'}
                    size={18}
                    color={COLORS.goldChampagne}
                  />
                </Pressable>
                {open ? <Text style={styles.faqAnswer}>{faq.answer}</Text> : null}
              </GlassCard>
            );
          })
        )}
      </FadeIn>

      <FadeIn delay={310}>
        <GlassCard highlighted>
          <Text style={styles.supportTitle}>Still need help?</Text>
          <Text style={styles.supportBody}>
            Contact our support team with your email and a short description of the issue. Include screenshots for faster resolution.
          </Text>
          <View style={styles.supportActions}>
            <GoldButton label="Contact Support" onPress={() => router.push('/(tabs)/contact')} style={styles.supportButton} />
            <GoldButton label="Privacy Policy" outlined onPress={() => void openPath('/privacy')} style={styles.supportButton} />
          </View>
          {actionMessage ? <Text style={styles.actionMessage}>{actionMessage}</Text> : null}
        </GlassCard>
      </FadeIn>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: COLORS.strokeSoft,
    borderRadius: RADIUS.md,
    backgroundColor: 'rgba(255,255,255,0.03)',
    paddingHorizontal: 11,
    paddingVertical: 8,
  },
  searchInput: {
    flex: 1,
    color: COLORS.offWhite,
    fontFamily: FONT.body,
    fontSize: 14,
    paddingVertical: 4,
  },
  searchMeta: {
    marginTop: 8,
    color: COLORS.textMuted,
    fontFamily: FONT.body,
    fontSize: 12,
  },
  sectionTitle: {
    color: COLORS.offWhite,
    fontFamily: FONT.display,
    fontSize: 24,
    marginBottom: 6,
  },
  actionGrid: {
    gap: 10,
  },
  actionCard: {
    borderWidth: 1,
    borderColor: COLORS.strokeSoft,
    borderRadius: RADIUS.lg,
    backgroundColor: 'rgba(255,255,255,0.03)',
    padding: 13,
  },
  actionCardPressed: {
    opacity: 0.84,
  },
  actionIconWrap: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: COLORS.stroke,
    backgroundColor: 'rgba(212,175,55,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  actionTitle: {
    color: COLORS.offWhite,
    fontFamily: FONT.bodySemiBold,
    fontSize: 15,
  },
  actionDescription: {
    marginTop: 4,
    color: COLORS.textMuted,
    fontFamily: FONT.body,
    fontSize: 12,
    lineHeight: 18,
  },
  actionCta: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
  actionCtaText: {
    color: COLORS.goldChampagne,
    fontFamily: FONT.bodySemiBold,
    fontSize: 12,
  },
  faqCard: {
    paddingVertical: 12,
  },
  faqHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    alignItems: 'center',
  },
  faqHeadPressed: {
    opacity: 0.86,
  },
  faqQuestion: {
    flex: 1,
    color: COLORS.offWhite,
    fontFamily: FONT.bodySemiBold,
    fontSize: 14,
    lineHeight: 19,
  },
  faqAnswer: {
    marginTop: 8,
    color: COLORS.textBody,
    fontFamily: FONT.body,
    fontSize: 13,
    lineHeight: 19,
  },
  emptyTitle: {
    color: COLORS.offWhite,
    fontFamily: FONT.bodySemiBold,
    fontSize: 16,
  },
  emptyBody: {
    marginTop: 4,
    color: COLORS.textMuted,
    fontFamily: FONT.body,
    fontSize: 13,
    lineHeight: 19,
  },
  supportTitle: {
    color: COLORS.offWhite,
    fontFamily: FONT.display,
    fontSize: 24,
  },
  supportBody: {
    marginTop: 6,
    color: COLORS.textMuted,
    fontFamily: FONT.body,
    fontSize: 13,
    lineHeight: 19,
  },
  supportActions: {
    marginTop: 12,
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
