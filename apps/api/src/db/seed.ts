import 'dotenv/config';
import mongoose from 'mongoose';
import {
  RelationshipType,
  SubscriptionTier,
  EmotionalReadiness,
  WantsChildren,
  type UserRole,
  type PaymentGateway,
  type PaymentPurpose,
  type PaymentStatus,
  type MatchStatus,
} from '@kujuana/shared';
import { connectDB, disconnectDB } from '../config/db.js';
import { logger } from '../config/logger.js';
import { hashPassword } from '../services/auth/password.service.js';
import { User } from '../models/User.model.js';
import { Profile } from '../models/Profile.model.js';
import { Match } from '../models/Match.model.js';
import { Subscription } from '../models/Subscription.model.js';
import { Payment } from '../models/Payment.model.js';
import { MatchRequest } from '../models/MatchRequest.model.js';
import { Notification } from '../models/Notification.model.js';
import { DeviceSession } from '../models/DeviceSession.model.js';
import { AuditLog } from '../models/AuditLog.model.js';

const CLEAR = process.argv.includes('--clear');

type SeedGender = 'male' | 'female';

interface SeedUserInput {
  fullName: string;
  email: string;
  phone: string;
  gender: SeedGender;
  age: number;
  tier: SubscriptionTier;
  coords: [number, number];
  country: string;
  countryCode: string;
  city: string;
  occupation: string;
  relationshipType: RelationshipType;
}

interface CreatedSeedUser {
  _id: mongoose.Types.ObjectId;
  email: string;
  fullName: string;
  tier: SubscriptionTier;
}

const pick = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)]!;
const pickN = <T>(arr: T[], n: number): T[] =>
  [...arr].sort(() => Math.random() - 0.5).slice(0, n);
const rand = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

const NAIROBI_COORDS: [number, number] = [36.8219, -1.2921];
const MOMBASA_COORDS: [number, number] = [39.6682, -4.0435];
const KAMPALA_COORDS: [number, number] = [32.5825, 0.3476];
const LONDON_COORDS: [number, number] = [-0.1276, 51.5074];
const TORONTO_COORDS: [number, number] = [-79.3832, 43.6532];

function dateOfBirthFromAge(age: number): Date {
  const date = new Date();
  date.setUTCFullYear(date.getUTCFullYear() - age);
  return date;
}

function fakePhotos(seed: string): Array<{
  publicId: string;
  url: string;
  isPrimary: boolean;
  isPrivate: boolean;
  order: number;
}> {
  return [1, 2, 3].map((n) => ({
    publicId: `kujuana/dev/${seed}/photo-${n}`,
    url: `https://res.cloudinary.com/demo/image/upload/v1/kujuana/dev/${seed}/photo-${n}.jpg`,
    isPrimary: n === 1,
    isPrivate: true,
    order: n,
  }));
}

async function clearCollections(): Promise<void> {
  logger.info('Clearing collections for seed...');
  await Promise.all([
    AuditLog.deleteMany({}),
    DeviceSession.deleteMany({}),
    Notification.deleteMany({}),
    MatchRequest.deleteMany({}),
    Match.deleteMany({}),
    Payment.deleteMany({}),
    Subscription.deleteMany({}),
    Profile.deleteMany({}),
    User.deleteMany({}),
  ]);
  logger.info('Collections cleared');
}

function subscriptionAddOnsForTier(tier: SubscriptionTier) {
  if (tier !== SubscriptionTier.VIP) return [];
  return ['international_filter', 'extra_credits'] as const;
}

async function createSeedUserWithProfileAndSubscription(
  input: SeedUserInput,
  passwordHash: string,
): Promise<CreatedSeedUser> {
  const user = await User.create({
    fullName: input.fullName,
    email: input.email,
    phone: input.phone,
    passwordHash,
    roles: ['member' satisfies UserRole],
    isEmailVerified: true,
    isPhoneVerified: true,
  });

  await Profile.create({
    userId: user._id,
    gender: input.gender,
    age: input.age,
    dateOfBirth: dateOfBirthFromAge(input.age),
    location: {
      city: input.city,
      country: input.country,
      countryCode: input.countryCode,
      coordinates: { type: 'Point', coordinates: input.coords },
    },
    relationshipStatus: 'single',
    occupation: input.occupation,
    lifestyle: pickN(
      [
        'active',
        'traveller',
        'foodie',
        'spiritual',
        'career-driven',
        'family-oriented',
      ],
      rand(2, 4),
    ),
    personalityTraits: pickN(
      ['empathetic', 'ambitious', 'grounded', 'nurturing', 'optimistic', 'humorous'],
      rand(2, 4),
    ),
    hasChildren: false,
    childrenCount: 0,
    wantsChildren: pick([WantsChildren.Yes, WantsChildren.OpenTo]),
    emotionalReadiness: pick([
      EmotionalReadiness.Ready,
      EmotionalReadiness.AlmostReady,
    ]),
    religion: pick(['christian', 'muslim', 'catholic', 'agnostic']),
    photos: fakePhotos(user._id.toString()),
    relationshipType: input.relationshipType,
    partnerValues: pickN(
      ['honesty', 'ambition', 'kindness', 'family-oriented', 'spirituality', 'loyalty'],
      rand(2, 4),
    ),
    idealPartnerDescription:
      'Looking for someone genuine, driven, and values family. I believe in building a life together with shared goals.',
    lifeVision:
      'A loving home, meaningful work, and adventures together around the world.',
    nonNegotiables: pickN(
      ['Must be honest', 'Must want children', 'Must be financially independent'],
      rand(1, 2),
    ),
    preferences: {
      ageRange: { min: Math.max(18, input.age - 5), max: Math.min(80, input.age + 7) },
      countries: [input.countryCode],
      lifestyle: ['active', 'traveller'],
      religion: 'any',
      international: input.tier === SubscriptionTier.VIP,
      religions: ['any'],
      maritalStatuses: ['single'],
      openToInternational: input.tier === SubscriptionTier.VIP,
      lifestylePreferences: ['active', 'traveller'],
    },
    onboardingStep: 6,
    onboardingComplete: true,
    isActive: true,
    isVisible: true,
    isPaused: false,
  });

  const periodStart = new Date();
  const periodEnd = new Date(periodStart.getTime() + 30 * 24 * 60 * 60 * 1000);
  const priorityCredits =
    input.tier === SubscriptionTier.Priority ? rand(2, 8) : 0;
  const subscriptionData: Record<string, unknown> = {
    userId: user._id,
    tier: input.tier,
    status: 'active',
    priorityCredits,
    totalCreditsPurchased: priorityCredits,
    totalCreditsUsed: 0,
    vipAddOns: [...subscriptionAddOnsForTier(input.tier)],
    autoRenew: true,
    cancelAtPeriodEnd: false,
  };

  if (input.tier === SubscriptionTier.Priority || input.tier === SubscriptionTier.VIP) {
    subscriptionData['currentPeriodStart'] = periodStart;
    subscriptionData['currentPeriodEnd'] = periodEnd;
    subscriptionData['nextBillingAt'] = periodEnd;
  }

  if (input.tier === SubscriptionTier.VIP) {
    subscriptionData['vipMonthlyMatchLimit'] = 30;
    subscriptionData['vipMatchesUsedThisCycle'] = rand(0, 5);
    subscriptionData['vipCycleStartedAt'] = periodStart;
    subscriptionData['vipCycleResetAt'] = periodEnd;
  }

  await Subscription.create(subscriptionData);

  logger.info(
    { email: user.email, name: user.fullName, tier: input.tier },
    'Seeded user',
  );

  return {
    _id: user._id,
    email: user.email,
    fullName: user.fullName,
    tier: input.tier,
  };
}

async function createSampleMatches(seedUsers: CreatedSeedUser[]): Promise<void> {
  const pairs: Array<[number, number, SubscriptionTier, MatchStatus, number]> = [
    [0, 5, SubscriptionTier.Standard, 'active', 78],
    [1, 6, SubscriptionTier.Standard, 'pending', 72],
    [8, 9, SubscriptionTier.Priority, 'accepted', 84],
    [11, 12, SubscriptionTier.VIP, 'active', 88],
  ];

  for (const [a, b, tier, status, total] of pairs) {
    const userA = seedUsers[a];
    const userB = seedUsers[b];
    if (!userA || !userB) continue;

    await Match.create({
      userId: userA._id,
      matchedUserId: userB._id,
      score: total,
      scoreBreakdown: {
        values: rand(65, 90),
        lifestyle: rand(60, 90),
        location: rand(60, 90),
        religion: rand(60, 90),
        ageCompatibility: rand(60, 90),
        vision: rand(60, 90),
        preferences: rand(60, 90),
        total,
      },
      tier,
      status,
      userAction: status === 'accepted' ? 'accepted' : 'pending',
      matchedUserAction: 'pending',
      ...(tier === SubscriptionTier.VIP ? { introductionNote: 'Curated by matchmaker.' } : {}),
    });
  }

  logger.info('Seeded sample matches');
}

async function createSamplePayments(seedUsers: CreatedSeedUser[]): Promise<void> {
  const priorityUser = seedUsers.find((u) => u.tier === SubscriptionTier.Priority);
  const vipUser = seedUsers.find((u) => u.tier === SubscriptionTier.VIP);
  if (!priorityUser || !vipUser) return;

  const now = Date.now();
  const paymentDocs: Array<{
    userId: mongoose.Types.ObjectId;
    gateway: PaymentGateway;
    reference: string;
    internalRef: string;
    idempotencyKey: string;
    amount: number;
    currency: 'KES';
    amountInKes: number;
    purpose: PaymentPurpose | 'vip_monthly' | 'priority_bundle_5';
    creditsGranted: number;
    status: PaymentStatus;
    phone: string;
    completedAt?: Date;
    metadata: Record<string, unknown>;
  }> = [
    {
      userId: priorityUser._id,
      gateway: 'flutterwave',
      reference: `FLW-${now}-001`,
      internalRef: `KUJ-${now}-P1`,
      idempotencyKey: `seed-payment-priority-${now}`,
      amount: 2000,
      currency: 'KES',
      amountInKes: 2000,
      purpose: 'priority_bundle_5',
      creditsGranted: 5,
      status: 'completed',
      phone: '+254711111009',
      completedAt: new Date(),
      metadata: {
        tier: SubscriptionTier.Priority,
        txRef: `seed-${now}-priority`,
        status: 'successful',
      },
    },
    {
      userId: vipUser._id,
      gateway: 'pesapal',
      reference: `PES-${now}-001`,
      internalRef: `KUJ-${now}-V1`,
      idempotencyKey: `seed-payment-vip-${now}`,
      amount: 15000,
      currency: 'KES',
      amountInKes: 15000,
      purpose: 'vip_monthly',
      creditsGranted: 0,
      status: 'completed',
      phone: '+254711111013',
      completedAt: new Date(),
      metadata: {
        tier: SubscriptionTier.VIP,
        orderTrackingId: `order-${now}-vip`,
        paymentMethod: 'card',
      },
    },
  ];

  await Payment.insertMany(paymentDocs);
  logger.info('Seeded sample payments');
}

export async function runSeed(): Promise<void> {
  await connectDB();

  if (CLEAR) {
    await clearCollections();
  }

  const adminPasswordHash = await hashPassword('Admin@kujuana2024!');
  const matchmakerPasswordHash = await hashPassword('Matchmaker@2024!');
  const memberPasswordHash = await hashPassword('Password@123!');

  await User.create({
    fullName: 'Kujuana Admin',
    email: 'admin@kujuana.com',
    phone: '+254700000001',
    passwordHash: adminPasswordHash,
    isEmailVerified: true,
    isPhoneVerified: true,
    roles: ['admin' satisfies UserRole],
  });

  await User.create({
    fullName: 'Grace Wanjiku',
    email: 'grace@kujuana.com',
    phone: '+254700000002',
    passwordHash: matchmakerPasswordHash,
    isEmailVerified: true,
    isPhoneVerified: true,
    roles: ['matchmaker' satisfies UserRole],
  });

  const usersData: SeedUserInput[] = [
    {
      fullName: 'Amina Hassan',
      email: 'amina@test.com',
      phone: '+254711111001',
      gender: 'female',
      age: 28,
      tier: SubscriptionTier.Standard,
      coords: NAIROBI_COORDS,
      country: 'Kenya',
      countryCode: 'KE',
      city: 'Nairobi',
      occupation: 'Software Engineer',
      relationshipType: RelationshipType.Marriage,
    },
    {
      fullName: 'Zawadi Ochieng',
      email: 'zawadi@test.com',
      phone: '+254711111002',
      gender: 'female',
      age: 32,
      tier: SubscriptionTier.Standard,
      coords: MOMBASA_COORDS,
      country: 'Kenya',
      countryCode: 'KE',
      city: 'Mombasa',
      occupation: 'Doctor',
      relationshipType: RelationshipType.SeriesCommitment,
    },
    {
      fullName: 'Njeri Kamau',
      email: 'njeri@test.com',
      phone: '+254711111003',
      gender: 'female',
      age: 26,
      tier: SubscriptionTier.Standard,
      coords: NAIROBI_COORDS,
      country: 'Kenya',
      countryCode: 'KE',
      city: 'Nairobi',
      occupation: 'Teacher',
      relationshipType: RelationshipType.Marriage,
    },
    {
      fullName: 'Halima Abdi',
      email: 'halima@test.com',
      phone: '+254711111004',
      gender: 'female',
      age: 35,
      tier: SubscriptionTier.Standard,
      coords: KAMPALA_COORDS,
      country: 'Uganda',
      countryCode: 'UG',
      city: 'Kampala',
      occupation: 'Entrepreneur',
      relationshipType: RelationshipType.Marriage,
    },
    {
      fullName: 'Aisha Mwangi',
      email: 'aisha@test.com',
      phone: '+254711111005',
      gender: 'female',
      age: 29,
      tier: SubscriptionTier.Standard,
      coords: LONDON_COORDS,
      country: 'United Kingdom',
      countryCode: 'GB',
      city: 'London',
      occupation: 'Nurse',
      relationshipType: RelationshipType.SeriesCommitment,
    },
    {
      fullName: 'Brian Otieno',
      email: 'brian@test.com',
      phone: '+254711111006',
      gender: 'male',
      age: 31,
      tier: SubscriptionTier.Standard,
      coords: NAIROBI_COORDS,
      country: 'Kenya',
      countryCode: 'KE',
      city: 'Nairobi',
      occupation: 'Accountant',
      relationshipType: RelationshipType.Marriage,
    },
    {
      fullName: 'Samuel Kariuki',
      email: 'samuel@test.com',
      phone: '+254711111007',
      gender: 'male',
      age: 27,
      tier: SubscriptionTier.Standard,
      coords: NAIROBI_COORDS,
      country: 'Kenya',
      countryCode: 'KE',
      city: 'Nairobi',
      occupation: 'Lawyer',
      relationshipType: RelationshipType.SeriesCommitment,
    },
    {
      fullName: 'David Mutua',
      email: 'david@test.com',
      phone: '+254711111008',
      gender: 'male',
      age: 34,
      tier: SubscriptionTier.Standard,
      coords: MOMBASA_COORDS,
      country: 'Kenya',
      countryCode: 'KE',
      city: 'Mombasa',
      occupation: 'Architect',
      relationshipType: RelationshipType.Marriage,
    },
    {
      fullName: 'Fatuma Yusuf',
      email: 'fatuma@test.com',
      phone: '+254711111009',
      gender: 'female',
      age: 30,
      tier: SubscriptionTier.Priority,
      coords: NAIROBI_COORDS,
      country: 'Kenya',
      countryCode: 'KE',
      city: 'Nairobi',
      occupation: 'Marketing Manager',
      relationshipType: RelationshipType.Marriage,
    },
    {
      fullName: 'Kevin Nderitu',
      email: 'kevin@test.com',
      phone: '+254711111010',
      gender: 'male',
      age: 33,
      tier: SubscriptionTier.Priority,
      coords: TORONTO_COORDS,
      country: 'Canada',
      countryCode: 'CA',
      city: 'Toronto',
      occupation: 'Data Scientist',
      relationshipType: RelationshipType.SeriesCommitment,
    },
    {
      fullName: 'Mercy Wambua',
      email: 'mercy@test.com',
      phone: '+254711111011',
      gender: 'female',
      age: 28,
      tier: SubscriptionTier.Priority,
      coords: NAIROBI_COORDS,
      country: 'Kenya',
      countryCode: 'KE',
      city: 'Nairobi',
      occupation: 'Pharmacist',
      relationshipType: RelationshipType.Marriage,
    },
    {
      fullName: 'Catherine Njuguna',
      email: 'catherine@test.com',
      phone: '+254711111012',
      gender: 'female',
      age: 36,
      tier: SubscriptionTier.VIP,
      coords: LONDON_COORDS,
      country: 'United Kingdom',
      countryCode: 'GB',
      city: 'London',
      occupation: 'Investment Banker',
      relationshipType: RelationshipType.Marriage,
    },
    {
      fullName: 'James Githinji',
      email: 'james@test.com',
      phone: '+254711111013',
      gender: 'male',
      age: 38,
      tier: SubscriptionTier.VIP,
      coords: NAIROBI_COORDS,
      country: 'Kenya',
      countryCode: 'KE',
      city: 'Nairobi',
      occupation: 'CEO',
      relationshipType: RelationshipType.Marriage,
    },
    {
      fullName: 'Abel Kibet',
      email: 'abel@test.com',
      phone: '+254711111014',
      gender: 'male',
      age: 29,
      tier: SubscriptionTier.Standard,
      coords: KAMPALA_COORDS,
      country: 'Uganda',
      countryCode: 'UG',
      city: 'Kampala',
      occupation: 'Product Manager',
      relationshipType: RelationshipType.SeriesCommitment,
    },
    {
      fullName: 'Lilian Naliaka',
      email: 'lilian@test.com',
      phone: '+254711111015',
      gender: 'female',
      age: 27,
      tier: SubscriptionTier.Standard,
      coords: TORONTO_COORDS,
      country: 'Canada',
      countryCode: 'CA',
      city: 'Toronto',
      occupation: 'Designer',
      relationshipType: RelationshipType.Marriage,
    },
  ];

  const createdUsers: CreatedSeedUser[] = [];
  for (const userInput of usersData) {
    createdUsers.push(
      await createSeedUserWithProfileAndSubscription(userInput, memberPasswordHash),
    );
  }

  await createSampleMatches(createdUsers);
  await createSamplePayments(createdUsers);

  const totalUsers = await User.countDocuments();
  const totalProfiles = await Profile.countDocuments();
  const totalSubscriptions = await Subscription.countDocuments();
  const totalMatches = await Match.countDocuments();
  const totalPayments = await Payment.countDocuments();

  logger.info(
    {
      totalUsers,
      totalProfiles,
      totalSubscriptions,
      totalMatches,
      totalPayments,
    },
    'Seed complete',
  );
  logger.info(
    'Login seeds: admin@kujuana.com/Admin@kujuana2024! and brian@test.com/Password@123!',
  );

  await disconnectDB();
}

runSeed().catch(async (err) => {
  logger.error({ err }, 'Seed failed');
  await disconnectDB();
  process.exit(1);
});
