import {
  loginSchema,
  registerSchema,
  step1PlanSchema,
  step2BasicSchema,
  step3BackgroundSchema,
  step5VisionSchema,
  step6PreferencesSchema,
  verifyEmailSchema,
} from '@kujuana/shared';
import type {
  LoginInput,
  RegisterInput,
  Step1Input,
  Step2Input,
  Step3Input,
  Step5Input,
  Step6Input,
  SubscriptionTier,
} from '@kujuana/shared';
import { z } from 'zod';
import { apiClient } from '@/lib/api/client';
import type {
  AdminAuditItem,
  AdminMemberItem,
  AdminQueueItem,
  AdminStatsResponse,
  AuthSession,
  LoginResponse,
  MatchItem,
  NotificationListResponse,
  PaymentInitiationResponse,
  ProfileMe,
  RegisterResponse,
  SaveStepResponse,
  SignedUploadParams,
  SubscriptionResponse,
} from '@/lib/api/types';

const respondSchema = z.object({ action: z.enum(['accepted', 'declined']) });

export async function registerUser(input: RegisterInput): Promise<RegisterResponse> {
  const parsed = registerSchema.parse(input);
  return apiClient.post<RegisterResponse>('/auth/register', parsed, false);
}

export async function loginUser(input: LoginInput): Promise<LoginResponse> {
  const parsed = loginSchema.parse(input);
  return apiClient.post<LoginResponse>('/auth/login', parsed, false);
}

export async function getAuthSession(): Promise<AuthSession> {
  return apiClient.get<AuthSession>('/auth/me');
}

export async function verifyEmail(input: { token: string; email: string }): Promise<{ message: string }> {
  verifyEmailSchema.parse({ token: input.token });
  return apiClient.post<{ message: string }>('/auth/verify-email', input, false);
}

export async function logoutUser(): Promise<{ message: string }> {
  return apiClient.post<{ message: string }>('/auth/logout');
}

export async function getMyProfile(): Promise<ProfileMe> {
  return apiClient.get<ProfileMe>('/profile/me');
}

export async function saveOnboardingStep(step: 1, payload: Step1Input): Promise<SaveStepResponse>;
export async function saveOnboardingStep(step: 2, payload: Step2Input): Promise<SaveStepResponse>;
export async function saveOnboardingStep(step: 3, payload: Step3Input): Promise<SaveStepResponse>;
export async function saveOnboardingStep(
  step: 4,
  payload: { photos: Array<{ publicId: string; order: number; isPrivate?: boolean }> },
): Promise<SaveStepResponse>;
export async function saveOnboardingStep(step: 5, payload: Step5Input): Promise<SaveStepResponse>;
export async function saveOnboardingStep(step: 6, payload: Step6Input): Promise<SaveStepResponse>;
export async function saveOnboardingStep(step: 1 | 2 | 3 | 4 | 5 | 6, payload: unknown): Promise<SaveStepResponse> {
  if (step === 1) step1PlanSchema.parse(payload);
  if (step === 2) step2BasicSchema.parse(payload);
  if (step === 3) step3BackgroundSchema.parse(payload);
  if (step === 5) step5VisionSchema.parse(payload);
  if (step === 6) step6PreferencesSchema.parse(payload);

  return apiClient.put<SaveStepResponse>(`/onboarding/step/${step}`, payload);
}

export async function submitOnboarding(): Promise<{ message: string }> {
  return apiClient.post<{ message: string }>('/onboarding/submit');
}

export async function getOnboardingProgress(): Promise<{ completeness: ProfileMe['completeness'] }> {
  return apiClient.get<{ completeness: ProfileMe['completeness'] }>('/onboarding/progress');
}

export async function listMatches(): Promise<MatchItem[]> {
  return apiClient.get<MatchItem[]>('/matches');
}

export async function getMatch(matchId: string): Promise<MatchItem> {
  return apiClient.get<MatchItem>(`/matches/${matchId}`);
}

export async function respondToMatch(matchId: string, action: 'accepted' | 'declined'): Promise<MatchItem> {
  respondSchema.parse({ action });
  return apiClient.patch<MatchItem>(`/matches/${matchId}/respond`, { action });
}

export async function requestPriorityMatch(): Promise<{ message: string; requestId: string; jobId: string | null }> {
  return apiClient.post<{ message: string; requestId: string; jobId: string | null }>('/matches/priority');
}

export async function listNotifications(page = 1, limit = 20): Promise<NotificationListResponse> {
  return apiClient.get<NotificationListResponse>(`/notifications?page=${page}&limit=${limit}`);
}

export async function markNotificationAsRead(id: string): Promise<{ status: string }> {
  return apiClient.patch<{ status: string }>(`/notifications/${id}/read`);
}

export async function markAllNotificationsAsRead(): Promise<{ modifiedCount: number }> {
  return apiClient.post<{ modifiedCount: number }>('/notifications/read-all');
}

export async function getSubscription(): Promise<SubscriptionResponse> {
  return apiClient.get<SubscriptionResponse>('/subscriptions/me');
}

export async function cancelSubscription(): Promise<{ message: string }> {
  return apiClient.post<{ message: string }>('/subscriptions/cancel');
}

export async function initiatePayment(input: {
  tier: SubscriptionTier;
  gateway: 'pesapal' | 'flutterwave' | 'mpesa' | 'paystack';
  currency: 'KES' | 'USD';
  purpose?:
    | 'subscription_new'
    | 'subscription_renewal'
    | 'subscription_upgrade'
    | 'addon_purchase'
    | 'credit_topup'
    | 'vip_monthly'
    | 'priority_single'
    | 'priority_bundle_5'
    | 'priority_bundle_10';
  phone?: string;
  returnUrl?: string;
}): Promise<PaymentInitiationResponse> {
  return apiClient.post<PaymentInitiationResponse>('/payments/initiate', input);
}

export async function getPaymentStatus(reference: string): Promise<{ reference: string; status: string }> {
  return apiClient.get<{ reference: string; status: string }>(`/payments/${encodeURIComponent(reference)}/status`);
}

export async function getAdminStats(): Promise<AdminStatsResponse> {
  return apiClient.get<AdminStatsResponse>('/admin/stats');
}

export async function listAdminQueue(): Promise<AdminQueueItem[]> {
  const payload = await apiClient.get<{ items?: AdminQueueItem[]; data?: AdminQueueItem[] } | AdminQueueItem[]>('/admin/queue');
  if (Array.isArray(payload)) return payload;
  return payload.items ?? payload.data ?? [];
}

export async function markAdminQueueInReview(requestId: string): Promise<{ message: string }> {
  return apiClient.post<{ message: string }>(`/admin/queue/${encodeURIComponent(requestId)}/review`);
}

export async function listAdminMembers(): Promise<AdminMemberItem[]> {
  const payload = await apiClient.get<{ items?: AdminMemberItem[]; data?: AdminMemberItem[] } | AdminMemberItem[]>('/admin/members');
  if (Array.isArray(payload)) return payload;
  return payload.items ?? payload.data ?? [];
}

export async function listAdminAudit(): Promise<AdminAuditItem[]> {
  const payload = await apiClient.get<{ items?: AdminAuditItem[]; data?: AdminAuditItem[] } | AdminAuditItem[]>('/admin/audit');
  if (Array.isArray(payload)) return payload;
  return payload.items ?? payload.data ?? [];
}

export async function getUploadSignature(): Promise<SignedUploadParams> {
  return apiClient.get<SignedUploadParams>('/upload/sign');
}

export async function confirmUpload(payload: { publicId: string; order: number }): Promise<{ message: string }> {
  return apiClient.post<{ message: string }>('/upload/confirm', payload);
}

export async function deleteUpload(publicId: string): Promise<{ message: string }> {
  return apiClient.delete<{ message: string }>(`/upload/${encodeURIComponent(publicId)}`);
}

export async function reorderUploads(
  photos: Array<{ publicId: string; order: number }>,
): Promise<{ message: string }> {
  return apiClient.put<{ message: string }>('/upload/reorder', { photos });
}
