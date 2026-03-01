export type MatchCard = {
  id: string;
  name: string;
  age: number;
  city: string;
  compatibility: number;
  tier: 'standard' | 'priority' | 'vip';
  intent: string;
  bio: string;
};

export const dashboardStats = {
  curatedThisWeek: 12,
  responseRate: 89,
  profileCompletion: 84,
  activeConversations: 5,
};

export const upcomingActions = [
  { id: 'a1', title: 'Refresh profile prompts', subtitle: 'Improve your match quality by 14%', due: 'Today' },
  { id: 'a2', title: 'Respond to 2 pending intros', subtitle: 'Priority members are waiting', due: 'Tonight' },
  { id: 'a3', title: 'Schedule your matchmaker call', subtitle: 'VIP concierge session', due: 'Tomorrow' },
];

export const topMatches: MatchCard[] = [
  {
    id: 'm1',
    name: 'Amina',
    age: 29,
    city: 'Nairobi',
    compatibility: 94,
    tier: 'vip',
    intent: 'Marriage in 2-3 years',
    bio: 'Architect, faith-driven, values consistency and depth. Enjoys books, travel and Sunday brunch.',
  },
  {
    id: 'm2',
    name: 'Brian',
    age: 32,
    city: 'Mombasa',
    compatibility: 91,
    tier: 'priority',
    intent: 'Intentional relationship',
    bio: 'Product lead and fitness enthusiast. Looking for a grounded partner with clear values.',
  },
  {
    id: 'm3',
    name: 'Nia',
    age: 27,
    city: 'Kampala',
    compatibility: 88,
    tier: 'standard',
    intent: 'Long-term dating',
    bio: 'Creative strategist with a calm personality. Loves art galleries and meaningful conversation.',
  },
  {
    id: 'm4',
    name: 'Kevin',
    age: 31,
    city: 'London',
    compatibility: 86,
    tier: 'priority',
    intent: 'Long-term commitment',
    bio: 'Finance professional in diaspora, family-oriented and emotionally available.',
  },
];

export const memberProfile = {
  fullName: 'Shari M.',
  age: 30,
  city: 'Nairobi, Kenya',
  tier: 'VIP',
  completeness: 84,
  occupation: 'Strategy Consultant',
  relationshipGoal: 'Marriage and family within 2-3 years',
  bio:
    'Intentional, warm, and growth-driven. I value faith, kindness, and ambition in equal measure. Building a meaningful partnership is my priority.',
  values: ['Faith', 'Family-first', 'Consistency', 'Purpose', 'Emotional maturity', 'Financial stewardship'],
  preferences: ['Age 28-36', 'Nairobi or diaspora', 'Non-smoker', 'Wants children'],
};

export const plans = [
  {
    id: 'standard',
    name: 'Standard',
    tagline: 'Begin with intention',
    price: 'Free',
    priceSub: 'Always',
    description: 'Nightly matching designed for a slow, intentional journey.',
    perks: ['Nightly batch matching', 'Up to 3 active matches', 'Basic filters'],
  },
  {
    id: 'priority',
    name: 'Priority',
    tagline: 'Move faster, match smarter',
    price: 'KES 500',
    priceSub: 'per match · bundles available',
    description: 'Instant matching with credits so you control your pace.',
    perks: ['Instant processing', 'Unlimited active matches', 'Advanced filters'],
  },
  {
    id: 'vip',
    name: 'VIP',
    tagline: 'The full Kujuana experience',
    price: 'KES 10,000',
    priceSub: 'per month',
    description: 'Premium curation with matchmaker-led introductions.',
    perks: ['Human matchmaker review', 'Personal introduction note', 'VIP curation queue'],
  },
];

export const priorityCreditBundles = [
  { credits: 1, price: 'KES 500', savings: null, tag: null },
  { credits: 5, price: 'KES 2,000', savings: 'Save KES 500', tag: 'Popular' },
  { credits: 10, price: 'KES 3,500', savings: 'Save KES 1,500', tag: 'Best Value' },
];
