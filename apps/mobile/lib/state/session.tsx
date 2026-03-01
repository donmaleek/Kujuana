import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { ApiError, apiClient, type SessionUser } from '@/lib/api/client';
import {
  clearStoredAccessToken,
  getOrCreateDeviceId,
  getStoredAccessToken,
  setStoredAccessToken,
} from '@/lib/api/storage';

type SessionStatus = 'bootstrapping' | 'signed_out' | 'signed_in';

type SessionContextValue = {
  status: SessionStatus;
  token: string | null;
  user: SessionUser | null;
  deviceId: string | null;
  authError: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
};

const SessionContext = createContext<SessionContextValue | null>(null);

function decodeJwtPayload(token: string): { exp?: number } | null {
  try {
    const payload = token.split('.')[1];
    if (!payload) return null;

    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
    const padded = normalized + '='.repeat((4 - (normalized.length % 4)) % 4);
    const decoded = globalThis.atob ? globalThis.atob(padded) : '';
    if (!decoded) return null;

    const parsed = JSON.parse(decoded) as { exp?: number };
    return parsed;
  } catch {
    return null;
  }
}

function isTokenExpired(token: string): boolean {
  const payload = decodeJwtPayload(token);
  if (!payload?.exp) return false;
  // 30s clock-skew buffer.
  return Date.now() >= payload.exp * 1000 - 30_000;
}

export function SessionProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<SessionStatus>('bootstrapping');
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<SessionUser | null>(null);
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);

  const applySignedOut = useCallback(async (message?: string) => {
    setToken(null);
    setUser(null);
    setStatus('signed_out');
    setAuthError(message ?? null);
    await clearStoredAccessToken();
  }, []);

  const refreshSession = useCallback(async () => {
    if (!token) return;
    if (isTokenExpired(token)) {
      await applySignedOut();
      return;
    }

    try {
      const nextUser = await apiClient.me(token, deviceId ?? undefined);
      setUser(nextUser);
      setStatus('signed_in');
      setAuthError(null);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Session expired';
      await applySignedOut(message);
    }
  }, [applySignedOut, deviceId, token]);

  const bootstrap = useCallback(async () => {
    const id = await getOrCreateDeviceId();
    setDeviceId(id);

    const storedToken = await getStoredAccessToken();
    if (!storedToken) {
      setStatus('signed_out');
      return;
    }

    if (isTokenExpired(storedToken)) {
      await applySignedOut();
      return;
    }

    try {
      const session = await apiClient.me(storedToken, id);
      setToken(storedToken);
      setUser(session);
      setStatus('signed_in');
      setAuthError(null);
    } catch {
      await applySignedOut('Please sign in again.');
    }
  }, [applySignedOut]);

  useEffect(() => {
    void bootstrap();
  }, [bootstrap]);

  const signIn = useCallback(async (email: string, password: string) => {
    const id = deviceId ?? (await getOrCreateDeviceId());
    if (!deviceId) setDeviceId(id);

    try {
      const result = await apiClient.login(email, password, id);
      await setStoredAccessToken(result.accessToken);
      setToken(result.accessToken);
      setUser(result.user);
      setStatus('signed_in');
      setAuthError(null);
    } catch (error) {
      const message =
        error instanceof ApiError
          ? error.message
          : error instanceof Error
            ? error.message
            : 'Unable to sign in';
      setAuthError(message);
      setStatus('signed_out');
      throw error;
    }
  }, [deviceId]);

  const signOut = useCallback(async () => {
    try {
      await apiClient.logout(token ?? undefined, deviceId ?? undefined);
    } catch {
      // Local logout still proceeds if server call fails.
    }
    await applySignedOut();
  }, [applySignedOut, deviceId, token]);

  const value = useMemo<SessionContextValue>(
    () => ({
      status,
      token,
      user,
      deviceId,
      authError,
      signIn,
      signOut,
      refreshSession,
    }),
    [authError, deviceId, refreshSession, signIn, signOut, status, token, user],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error('useSession must be used within SessionProvider');
  }
  return context;
}
