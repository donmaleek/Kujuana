import { useMemo, useState } from 'react';
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

type BlogCategory = 'All' | 'Dating Psychology' | 'Compatibility' | 'Profile Strategy' | 'Safety & Trust';

type BlogEntry = {
  id: string;
  title: string;
  category: Exclude<BlogCategory, 'All'>;
  readTime: string;
  excerpt: string;
  author: string;
  path: string;
};

const BLOG_CATEGORIES: BlogCategory[] = ['All', 'Dating Psychology', 'Compatibility', 'Profile Strategy', 'Safety & Trust'];

const BLOG_ENTRIES: BlogEntry[] = [
  {
    id: 'signals',
    title: 'The 5 Signals That Predict Long-Term Compatibility Early',
    category: 'Compatibility',
    readTime: '7 min',
    author: 'Amani K.',
    excerpt: 'Identify practical signs that someone is aligned with your long-term relationship goals.',
    path: '/blog#signals',
  },
  {
    id: 'bio-upgrade',
    title: 'How To Write a Premium Bio That Attracts Intentional Matches',
    category: 'Profile Strategy',
    readTime: '6 min',
    author: 'Kujuana Team',
    excerpt: 'Use a clear structure that highlights values, vision, and compatibility priorities.',
    path: '/blog#bio-upgrade',
  },
  {
    id: 'safe-first-date',
    title: 'First-Date Safety Standard: A Calm Checklist That Works',
    category: 'Safety & Trust',
    readTime: '5 min',
    author: 'Trust & Safety',
    excerpt: 'Protect your peace with practical safety standards before and during each first date.',
    path: '/blog#safe-first-date',
  },
  {
    id: 'conversation-rhythm',
    title: 'Build Better Conversation Rhythm Without Burnout',
    category: 'Dating Psychology',
    readTime: '4 min',
    author: 'Editorial Desk',
    excerpt: 'Avoid over-texting and keep momentum with healthier communication pacing.',
    path: '/blog#conversation-rhythm',
  },
  {
    id: 'respectful-exit',
    title: 'How to Exit Misaligned Connections Respectfully',
    category: 'Dating Psychology',
    readTime: '8 min',
    author: 'Amani K.',
    excerpt: 'Use concise scripts to end misaligned paths while protecting your standards and energy.',
    path: '/blog#respectful-exit',
  },
  {
    id: 'chat-to-date',
    title: 'From Chat to Date: A Better Transition Script',
    category: 'Profile Strategy',
    readTime: '5 min',
    author: 'Kujuana Team',
    excerpt: 'Move from conversation to confident date planning without mixed signals.',
    path: '/blog#chat-to-date',
  },
];

export default function BlogScreen() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<BlogCategory>('All');
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const filteredEntries = useMemo(() => {
    if (selectedCategory === 'All') return BLOG_ENTRIES;
    return BLOG_ENTRIES.filter((entry) => entry.category === selectedCategory);
  }, [selectedCategory]);

  async function openPath(path: string) {
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
          title="Blog"
          subtitle="Comprehensive dating insights, expert playbooks, and strategy for intentional relationships."
        />
      </FadeIn>

      <FadeIn delay={100}>
        <GlassCard highlighted>
          <Text style={styles.heroTitle}>Kujuana Journal</Text>
          <Text style={styles.heroBody}>
            Learn how to date with confidence, filter for real compatibility, and build healthy momentum from first chat
            to long-term commitment.
          </Text>
          <View style={styles.heroPills}>
            <Pill icon="book-open-page-variant-outline" label="Editorial Guides" />
            <Pill icon="heart-multiple-outline" label="Intentional Dating" />
            <Pill icon="shield-check-outline" label="Safety Standards" />
          </View>
        </GlassCard>
      </FadeIn>

      <FadeIn delay={170}>
        <Text style={styles.sectionTitle}>Browse by category</Text>
        <View style={styles.categoryRow}>
          {BLOG_CATEGORIES.map((category) => {
            const isActive = category === selectedCategory;
            return (
              <Pressable
                key={category}
                onPress={() => setSelectedCategory(category)}
                style={({ pressed }) => [
                  styles.categoryChip,
                  isActive && styles.categoryChipActive,
                  pressed && styles.categoryChipPressed,
                ]}
              >
                <Text style={[styles.categoryChipText, isActive && styles.categoryChipTextActive]}>{category}</Text>
              </Pressable>
            );
          })}
        </View>
      </FadeIn>

      <FadeIn delay={240}>
        <GlassCard>
          <Text style={styles.sectionTitle}>Featured</Text>
          <Text style={styles.featureTitle}>Intentional Dating Framework: Build Better Relationships in 6 Weeks</Text>
          <Text style={styles.featureBody}>
            A complete system for profile clarity, first-date safety, and values-based compatibility.
          </Text>
          <View style={styles.metaRow}>
            <Meta icon="clock-outline" label="11 min" />
            <Meta icon="account-outline" label="Kujuana Editorial Team" />
          </View>
          <GoldButton label="Read Featured Story" onPress={() => void openPath('/blog#featured-framework')} />
        </GlassCard>
      </FadeIn>

      <FadeIn delay={310}>
        <Text style={styles.sectionTitle}>Latest articles</Text>
        <View style={styles.articleList}>
          {filteredEntries.map((entry) => (
            <Pressable
              key={entry.id}
              onPress={() => void openPath(entry.path)}
              style={({ pressed }) => [styles.articleCard, pressed && styles.articleCardPressed]}
            >
              <View style={styles.articleHead}>
                <Text style={styles.articleCategory}>{entry.category}</Text>
                <Text style={styles.articleReadTime}>{entry.readTime}</Text>
              </View>
              <Text style={styles.articleTitle}>{entry.title}</Text>
              <Text style={styles.articleExcerpt}>{entry.excerpt}</Text>
              <View style={styles.articleFooter}>
                <Text style={styles.articleAuthor}>{entry.author}</Text>
                <View style={styles.readCta}>
                  <Text style={styles.readCtaText}>Read</Text>
                  <MaterialCommunityIcons name="chevron-right" size={15} color={COLORS.goldChampagne} />
                </View>
              </View>
            </Pressable>
          ))}
        </View>
      </FadeIn>

      <FadeIn delay={380}>
        <GlassCard>
          <Text style={styles.sectionTitle}>Need guided support?</Text>
          <Text style={styles.supportBody}>
            For direct account help, dating safety guidance, or premium support, use these quick routes.
          </Text>
          <View style={styles.supportButtons}>
            <GoldButton label="Help Centre" onPress={() => router.push('/(tabs)/help')} style={styles.supportButton} />
            <GoldButton label="Safety Tips" outlined onPress={() => router.push('/(tabs)/safety')} style={styles.supportButton} />
          </View>
          <View style={styles.supportButtons}>
            <GoldButton label="Contact Us" outlined onPress={() => router.push('/(tabs)/contact')} style={styles.supportButton} />
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

function Meta({ icon, label }: { icon: IconName; label: string }) {
  return (
    <View style={styles.metaItem}>
      <MaterialCommunityIcons name={icon} size={14} color={COLORS.textMuted} />
      <Text style={styles.metaText}>{label}</Text>
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
  categoryRow: {
    marginTop: 2,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryChip: {
    borderRadius: RADIUS.pill,
    borderWidth: 1,
    borderColor: COLORS.strokeSoft,
    backgroundColor: 'rgba(255,255,255,0.03)',
    paddingHorizontal: 11,
    paddingVertical: 7,
  },
  categoryChipActive: {
    borderColor: COLORS.stroke,
    backgroundColor: 'rgba(212,175,55,0.15)',
  },
  categoryChipPressed: {
    opacity: 0.86,
  },
  categoryChipText: {
    color: COLORS.textMuted,
    fontFamily: FONT.bodyMedium,
    fontSize: 12,
  },
  categoryChipTextActive: {
    color: COLORS.goldChampagne,
  },
  featureTitle: {
    marginTop: 6,
    color: COLORS.offWhite,
    fontFamily: FONT.display,
    fontSize: 28,
    lineHeight: 30,
  },
  featureBody: {
    marginTop: 4,
    color: COLORS.textBody,
    fontFamily: FONT.body,
    fontSize: 13,
    lineHeight: 19,
  },
  metaRow: {
    marginTop: 10,
    marginBottom: 12,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  metaText: {
    color: COLORS.textMuted,
    fontFamily: FONT.body,
    fontSize: 12,
  },
  articleList: {
    gap: 10,
  },
  articleCard: {
    borderWidth: 1,
    borderColor: COLORS.strokeSoft,
    borderRadius: RADIUS.lg,
    backgroundColor: 'rgba(255,255,255,0.03)',
    padding: 13,
  },
  articleCardPressed: {
    opacity: 0.86,
  },
  articleHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
    alignItems: 'center',
  },
  articleCategory: {
    color: COLORS.goldChampagne,
    fontFamily: FONT.bodySemiBold,
    fontSize: 11,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  articleReadTime: {
    color: COLORS.textMuted,
    fontFamily: FONT.body,
    fontSize: 12,
  },
  articleTitle: {
    marginTop: 6,
    color: COLORS.offWhite,
    fontFamily: FONT.bodySemiBold,
    fontSize: 15,
    lineHeight: 20,
  },
  articleExcerpt: {
    marginTop: 4,
    color: COLORS.textBody,
    fontFamily: FONT.body,
    fontSize: 13,
    lineHeight: 19,
  },
  articleFooter: {
    marginTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
  },
  articleAuthor: {
    color: COLORS.textMuted,
    fontFamily: FONT.body,
    fontSize: 12,
  },
  readCta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 1,
  },
  readCtaText: {
    color: COLORS.goldChampagne,
    fontFamily: FONT.bodySemiBold,
    fontSize: 12,
  },
  supportBody: {
    marginTop: 4,
    color: COLORS.textMuted,
    fontFamily: FONT.body,
    fontSize: 13,
    lineHeight: 19,
  },
  supportButtons: {
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
