import { ENV } from '@/lib/config/env';
import { clearSessionStorage, getOrCreateDeviceId, updateStoredAccessToken } from '@/lib/auth/secure-session';
import { ApiError, type ApiErrorBody, type RefreshResponse } from '@/lib/api/types';
import { useAuthStore } from '@/store/auth-store';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

interface RequestOptions {
  method?: HttpMethod;
  body?: unknown;
  requiresAuth?: boolean;
  headers?: HeadersInit;
  retryOnUnauthorized?: boolean;
}

let refreshPromise: Promise<string | null> | null = null;

function connectionHint(): string {
  return `Unable to reach API at ${ENV.apiBaseUrl}. If you are on a phone, set EXPO_PUBLIC_API_URL in apps/mobile/.env to your computer IP (example: http://192.168.1.50:4000/api/v1), then restart Expo.`;
}

async function parseJsonSafely(response: Response): Promise<unknown> {
  const raw = await response.text();
  if (!raw) return null;

  try {
    return JSON.parse(raw);
  } catch {
    return raw;
  }
}

async function ensureDeviceId(): Promise<string> {
  const store = useAuthStore.getState();
  if (store.deviceId) return store.deviceId;

  const deviceId = await getOrCreateDeviceId();
  useAuthStore.getState().setDeviceId(deviceId);

  return deviceId;
}

async function refreshAccessToken(deviceId: string): Promise<string | null> {
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    let response: Response;
    try {
      response = await fetch(`${ENV.apiBaseUrl}/auth/refresh`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'x-device-id': deviceId,
        },
      });
    } catch {
      throw new ApiError(connectionHint(), 0);
    }

    if (!response.ok) {
      await clearSessionStorage();
      useAuthStore.getState().setSignedOut();
      return null;
    }

    const payload = (await parseJsonSafely(response)) as RefreshResponse;
    if (!payload?.accessToken) {
      await clearSessionStorage();
      useAuthStore.getState().setSignedOut();
      return null;
    }

    const currentState = useAuthStore.getState();
    if (!currentState.userId) {
      await clearSessionStorage();
      useAuthStore.getState().setSignedOut();
      return null;
    }

    useAuthStore.getState().setSignedIn(payload.accessToken, currentState.userId);
    await updateStoredAccessToken(payload.accessToken);

    return payload.accessToken;
  })();

  const token = await refreshPromise;
  refreshPromise = null;

  return token;
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const requiresAuth = options.requiresAuth ?? true;
  const retryOnUnauthorized = options.retryOnUnauthorized ?? true;

  const deviceId = await ensureDeviceId();
  const authState = useAuthStore.getState();

  let response: Response;
  try {
    response = await fetch(`${ENV.apiBaseUrl}${path}`, {
      method: options.method ?? 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'x-device-id': deviceId,
        ...(requiresAuth && authState.accessToken
          ? { Authorization: `Bearer ${authState.accessToken}` }
          : {}),
        ...(options.headers ?? {}),
      },
      ...(options.body !== undefined ? { body: JSON.stringify(options.body) } : {}),
    });
  } catch {
    throw new ApiError(connectionHint(), 0);
  }

  if (response.status === 401 && requiresAuth && retryOnUnauthorized) {
    const refreshedToken = await refreshAccessToken(deviceId);
    if (refreshedToken) {
      return request<T>(path, { ...options, retryOnUnauthorized: false });
    }
  }

  if (!response.ok) {
    const payload = (await parseJsonSafely(response)) as ApiErrorBody | null;
    throw new ApiError(
      payload?.error ?? `Request failed with status ${response.status}`,
      response.status,
      payload?.details,
    );
  }

  if (response.status === 204) return {} as T;

  return (await parseJsonSafely(response)) as T;
}

export const apiClient = {
  get: <T>(path: string, requiresAuth = true, headers?: HeadersInit) =>
    request<T>(path, { method: 'GET', requiresAuth, headers }),
  post: <T>(path: string, body?: unknown, requiresAuth = true, headers?: HeadersInit) =>
    request<T>(path, { method: 'POST', body, requiresAuth, headers }),
  put: <T>(path: string, body?: unknown, requiresAuth = true, headers?: HeadersInit) =>
    request<T>(path, { method: 'PUT', body, requiresAuth, headers }),
  patch: <T>(path: string, body?: unknown, requiresAuth = true, headers?: HeadersInit) =>
    request<T>(path, { method: 'PATCH', body, requiresAuth, headers }),
  delete: <T>(path: string, requiresAuth = true, headers?: HeadersInit) =>
    request<T>(path, { method: 'DELETE', requiresAuth, headers }),
};
