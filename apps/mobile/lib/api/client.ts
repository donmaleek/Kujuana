import { API_CONFIG } from './config';

export type SessionUser = {
  id: string;
  userId: string;
  email: string;
  fullName: string;
  role: 'admin' | 'manager' | 'matchmaker' | 'user';
  tier: 'standard' | 'priority' | 'vip';
  credits: number;
  profileCompleted: boolean;
  isEmailVerified: boolean;
};

export type LoginResponse = {
  accessToken: string;
  userId: string;
  user: SessionUser;
};

export type RegisterPayload = {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  agreedToTerms: boolean;
};

export type RegisterResponse = {
  userId: string;
  message: string;
  verification?: {
    delivered: boolean;
    previewUrl?: string;
  };
};

export type ApiProfile = {
  id: string;
  userId: string;
  fullName: string;
  email: string;
  age?: number | null;
  occupation?: string | null;
  religion?: string | null;
  tier?: 'standard' | 'priority' | 'vip';
  credits?: number;
  status?: string;
  completeness?: number;
  profileCompleteness?: number;
  bio?: string;
  relationshipVision?: string;
  location?: {
    city?: string;
    country?: string;
    label?: string;
  };
  nonNegotiables?: string[];
  preferences?: Record<string, unknown>;
  settings?: Record<string, unknown>;
};

export type ApiSubscription = {
  tier: 'standard' | 'priority' | 'vip';
  status: string;
  isPaid?: boolean;
  credits?: number;
  priorityCredits?: number;
  renewsAt?: string | null;
  nextBillingAt?: string | null;
  cancelAtPeriodEnd?: boolean;
};

export type ApiMatch = {
  id: string;
  _id?: string;
  status: string;
  score: number;
  compatibilityScore?: number;
  tier: 'standard' | 'priority' | 'vip';
  createdAt?: string;
  updatedAt?: string;
  userAction?: 'pending' | 'accepted' | 'declined' | string;
  matchedUserAction?: 'pending' | 'accepted' | 'declined' | string;
  other?: {
    id: string;
    fullName?: string;
    firstName?: string;
    age?: number | null;
    location?: string | null;
    bio?: string | null;
    photos?: Array<{ url: string }>;
    blurredPhotoUrl?: string | null;
  };
};

export class ApiError extends Error {
  status: number;
  code?: string;
  payload?: unknown;

  constructor(message: string, status: number, code?: string, payload?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.payload = payload;
  }
}

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
  body?: unknown;
  token?: string;
  deviceId?: string;
  timeoutMs?: number;
};

function firstValidationDetail(details: unknown): string | null {
  if (!details || typeof details !== 'object') return null;
  for (const value of Object.values(details as Record<string, unknown>)) {
    if (Array.isArray(value) && value.length > 0) {
      const first = value[0];
      if (typeof first === 'string' && first.trim().length > 0) {
        return first.trim();
      }
    }
  }
  return null;
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const {
    method = 'GET',
    body,
    token,
    deviceId,
    timeoutMs = 15000,
  } = options;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  const headers: Record<string, string> = {
    Accept: 'application/json',
  };

  if (body !== undefined) {
    headers['Content-Type'] = 'application/json';
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  if (deviceId) {
    headers['x-device-id'] = deviceId;
  }

  try {
    const response = await fetch(`${API_CONFIG.baseUrl}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });

    const raw = await response.text();
    let payload: any = null;
    if (raw) {
      try {
        payload = JSON.parse(raw);
      } catch {
        payload = null;
      }
    }

    if (!response.ok) {
      const detailMessage = firstValidationDetail(payload?.details);
      const payloadError =
        typeof payload?.error === 'string'
          ? payload.error
          : payload?.error?.message;
      const errorMessage =
        (payloadError === 'Validation failed' && detailMessage ? detailMessage : null) ||
        payloadError ||
        detailMessage ||
        payload?.message ||
        `Request failed (${response.status})`;
      const code = payload?.error?.code || payload?.code;
      throw new ApiError(errorMessage, response.status, code, payload ?? raw);
    }

    return (payload ?? {}) as T;
  } catch (error: any) {
    if (error?.name === 'AbortError') {
      throw new ApiError('Request timed out. Please try again.', 408);
    }
    if (error instanceof ApiError) throw error;
    throw new ApiError(error?.message || 'Network request failed', 0);
  } finally {
    clearTimeout(timeout);
  }
}

export const apiClient = {
  register(payload: RegisterPayload, deviceId?: string) {
    return request<RegisterResponse>('/auth/register', {
      method: 'POST',
      body: payload,
      deviceId,
    });
  },

  login(email: string, password: string, deviceId: string) {
    return request<LoginResponse>('/auth/login', {
      method: 'POST',
      body: { email, password },
      deviceId,
    });
  },

  me(token: string, deviceId?: string) {
    return request<SessionUser>('/auth/me', {
      token,
      deviceId,
    });
  },

  logout(token?: string, deviceId?: string) {
    return request<{ message: string }>('/auth/logout', {
      method: 'POST',
      token,
      deviceId,
    });
  },

  profileMe(token: string, deviceId?: string) {
    return request<ApiProfile>('/profile/me', {
      token,
      deviceId,
    });
  },

  updateProfile(token: string, patch: Record<string, unknown>, deviceId?: string) {
    return request<ApiProfile>('/profile/me', {
      method: 'PATCH',
      token,
      body: patch,
      deviceId,
    });
  },

  async listMatches(token: string, deviceId?: string): Promise<ApiMatch[]> {
    const payload = await request<any>('/matches', {
      token,
      deviceId,
    });

    if (Array.isArray(payload?.items)) return payload.items as ApiMatch[];
    if (Array.isArray(payload?.data?.items)) return payload.data.items as ApiMatch[];
    if (Array.isArray(payload)) return payload as ApiMatch[];
    return [];
  },

  respondToMatch(
    token: string,
    matchId: string,
    action: 'accepted' | 'declined',
    deviceId?: string,
  ) {
    return request<{ status: string; userAction: string }>('/matches/' + matchId + '/respond', {
      method: 'PATCH',
      token,
      deviceId,
      body: { action },
    });
  },

  subscriptionMe(token: string, deviceId?: string) {
    return request<ApiSubscription>('/subscriptions/me', {
      token,
      deviceId,
    });
  },
};
