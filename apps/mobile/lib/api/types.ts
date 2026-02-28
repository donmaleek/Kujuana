import type {
  Step1Input,
  Step2Input,
  Step3Input,
  Step5Input,
  Step6Input,
  SubscriptionTier,
} from '@kujuana/shared';

export interface ApiErrorBody {
  error?: string;
  details?: unknown;
}

export class ApiError extends Error {
  status: number;

  details?: unknown;

  constructor(message: string, status: number, details?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }
}

export interface RegisterResponse {
  userId: string;
  message: string;
}

export interface AuthSession {
  id: string;
  userId: string;
  email: string;
  fullName: string;
  role: 'admin' | 'manager' | 'matchmaker' | 'user';
  tier: SubscriptionTier | 'standard';
  credits: number;
  profileCompleted: boolean;
  isEmailVerified: boolean;
}

export interface LoginResponse {
  accessToken: string;
  userId: string;
  user?: AuthSession;
}

export interface RefreshResponse {
  accessToken: string;
}

export interface ProfilePhoto {
  publicId: string;
  url?: string;
  order?: number;
  isPrimary?: boolean;
  isPrivate?: boolean;
}

export interface ProfileCompleteness {
  basic: boolean;
  background: boolean;
  photos: boolean;
  vision: boolean;
  preferences: boolean;
  overall: number;
}

export interface ProfileMe {
  _id: string;
  userId: string;
  fullName?: string;
  email?: string;
  tier?: SubscriptionTier | 'standard';
  credits?: number;
  status?: string;
  onboardingStep: number;
  onboardingComplete: boolean;
  isSubmitted?: boolean;
  basic?: Partial<Step2Input>;
  background?: Partial<Step3Input>;
  vision?: Partial<Step5Input>;
  preferences?: Partial<Step6Input>;
  completeness: ProfileCompleteness;
  profileCompleteness?: number;
  photos: ProfilePhoto[];
  [key: string]: unknown;
}

export interface SaveStepResponse {
  message: string;
  completeness: ProfileCompleteness;
}

export interface SignedUploadParams {
  signature: string;
  timestamp: number;
  folder: string;
  api_key: string;
  cloud_name: string;
}

export interface MatchItem {
  _id: string;
  userId: string;
  matchedUserId: string;
  score: number;
  scoreBreakdown: {
    values: number;
    lifestyle: number;
    location: number;
    religion: number;
    ageCompatibility: number;
    vision: number;
    preferences: number;
    total: number;
  };
  tier: SubscriptionTier;
  status: 'pending' | 'active' | 'accepted' | 'declined' | 'expired';
  userAction: 'accepted' | 'declined' | 'pending';
  matchedUserAction: 'accepted' | 'declined' | 'pending';
  introductionNote?: string;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationItem {
  _id: string;
  type: string;
  status: 'pending' | 'sent' | 'failed' | 'read';
  title: string;
  body: string;
  createdAt: string;
}

export interface NotificationListResponse {
  items: NotificationItem[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface SubscriptionResponse {
  tier: SubscriptionTier | 'none';
  status: string;
  isPaid?: boolean;
  credits?: number;
  priorityCredits?: number;
  currentPeriodEnd?: string;
  renewsAt?: string | null;
  nextBillingAt?: string | null;
  cancelAtPeriodEnd?: boolean;
}

export interface PaymentInitiationResponse {
  paymentId: string;
  paymentReference: string;
  checkoutUrl?: string;
  reference?: string;
  redirectUrl?: string | null;
  message?: string;
  simulated?: boolean;
  stk?: boolean;
  reused: boolean;
}

export interface AdminStatsResponse {
  ok: boolean;
  generatedAt: string;
  membersTotal: number;
  activeMembers: number;
  matchesTotal: number;
  matchesPending: number;
  vipMembers: number;
  priorityCreditsOutstanding: number;
  revenueMonthKES: number;
  revenueMonthUSD: number;
}

export interface AdminQueueItem {
  id: string;
  tier: 'priority' | 'vip';
  kind: 'priority' | 'vip';
  status: 'pending' | 'review' | 'introduced' | string;
  createdAt: string;
  requesterName: string;
  requestedByName: string;
  requestedByUserId: string;
  requestedByEmail?: string;
  candidateName: string;
  score: number;
  waitHours: number;
  matchId?: string;
  requestId?: string;
}

export interface AdminMemberItem {
  id: string;
  fullName: string;
  email: string;
  tier: SubscriptionTier | 'standard';
  credits: number;
  isActive: boolean;
  profileCompleteness: number;
  createdAt: string;
  lastSeenAt?: string;
}

export interface AdminAuditItem {
  id: string;
  actor: string;
  action: string;
  target: string | null;
  ip: string | null;
  createdAt: string;
  actorId?: string;
  actorEmail?: string;
  targetUserId?: string;
  targetEmail?: string;
  meta?: Record<string, unknown>;
}

export type OnboardingPayload = Step1Input | Step2Input | Step3Input | Step5Input | Step6Input | {
  photos: Array<{ publicId: string; order: number; isPrivate?: boolean }>;
};
