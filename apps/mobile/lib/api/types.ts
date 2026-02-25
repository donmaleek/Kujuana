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

export interface LoginResponse {
  accessToken: string;
  userId: string;
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
  onboardingStep: number;
  onboardingComplete: boolean;
  isSubmitted?: boolean;
  basic?: Partial<Step2Input>;
  background?: Partial<Step3Input>;
  vision?: Partial<Step5Input>;
  preferences?: Partial<Step6Input>;
  completeness: ProfileCompleteness;
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
  credits?: number;
  currentPeriodEnd?: string;
  cancelAtPeriodEnd?: boolean;
}

export interface PaymentInitiationResponse {
  paymentId: string;
  paymentReference: string;
  checkoutUrl: string;
  reused: boolean;
}

export type OnboardingPayload = Step1Input | Step2Input | Step3Input | Step5Input | Step6Input | {
  photos: Array<{ publicId: string; order: number; isPrivate?: boolean }>;
};
