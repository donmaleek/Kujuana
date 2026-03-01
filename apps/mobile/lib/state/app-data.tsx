import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { ApiError, apiClient, type ApiMatch, type ApiProfile, type ApiSubscription } from '@/lib/api/client';
import { useSession } from './session';

type AppDataContextValue = {
  profile: ApiProfile | null;
  matches: ApiMatch[];
  subscription: ApiSubscription | null;
  loading: boolean;
  refreshing: boolean;
  error: string | null;
  refreshAll: () => Promise<void>;
  respondToMatch: (matchId: string, action: 'accepted' | 'declined') => Promise<void>;
  saveSettings: (patch: Record<string, unknown>) => Promise<void>;
  updateProfile: (patch: Record<string, unknown>) => Promise<void>;
};

const AppDataContext = createContext<AppDataContextValue | null>(null);

export function AppDataProvider({ children }: { children: ReactNode }) {
  const { status, token, deviceId, signOut } = useSession();

  const [profile, setProfile] = useState<ApiProfile | null>(null);
  const [matches, setMatches] = useState<ApiMatch[]>([]);
  const [subscription, setSubscription] = useState<ApiSubscription | null>(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAuthFailure = useCallback(
    async (err: unknown) => {
      if (err instanceof ApiError && err.status === 401) {
        await signOut();
        return true;
      }
      return false;
    },
    [signOut],
  );

  const refreshAll = useCallback(async () => {
    if (!token || status !== 'signed_in') return;

    setRefreshing(true);
    setError(null);

    try {
      const [nextProfile, nextMatches, nextSubscription] = await Promise.all([
        apiClient.profileMe(token, deviceId ?? undefined),
        apiClient.listMatches(token, deviceId ?? undefined),
        apiClient.subscriptionMe(token, deviceId ?? undefined),
      ]);

      setProfile(nextProfile);
      setMatches(nextMatches);
      setSubscription(nextSubscription);
    } catch (err) {
      if (await handleAuthFailure(err)) return;
      setError(err instanceof Error ? err.message : 'Failed to sync account data.');
    } finally {
      setRefreshing(false);
    }
  }, [deviceId, handleAuthFailure, status, token]);

  useEffect(() => {
    if (status !== 'signed_in' || !token) {
      setProfile(null);
      setMatches([]);
      setSubscription(null);
      setLoading(false);
      setRefreshing(false);
      setError(null);
      return;
    }

    let cancelled = false;

    const runInitialLoad = async () => {
      setLoading(true);
      setError(null);
      try {
        const [nextProfile, nextMatches, nextSubscription] = await Promise.all([
          apiClient.profileMe(token, deviceId ?? undefined),
          apiClient.listMatches(token, deviceId ?? undefined),
          apiClient.subscriptionMe(token, deviceId ?? undefined),
        ]);

        if (cancelled) return;
        setProfile(nextProfile);
        setMatches(nextMatches);
        setSubscription(nextSubscription);
      } catch (err) {
        if (cancelled) return;
        if (await handleAuthFailure(err)) return;
        setError(err instanceof Error ? err.message : 'Unable to load data.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void runInitialLoad();

    return () => {
      cancelled = true;
    };
  }, [deviceId, handleAuthFailure, status, token]);

  const respondToMatch = useCallback(
    async (matchId: string, action: 'accepted' | 'declined') => {
      if (!token || status !== 'signed_in') return;
      setError(null);

      const previousMatches = matches;
      setMatches((current) =>
        current.map((match) => (match.id === matchId ? { ...match, userAction: action } : match)),
      );

      try {
        await apiClient.respondToMatch(token, matchId, action, deviceId ?? undefined);
      } catch (err) {
        setMatches(previousMatches);
        if (await handleAuthFailure(err)) return;
        setError(err instanceof Error ? err.message : 'Unable to respond to match.');
      }
    },
    [deviceId, handleAuthFailure, matches, status, token],
  );

  const updateProfile = useCallback(
    async (patch: Record<string, unknown>) => {
      if (!token || status !== 'signed_in') return;
      setError(null);

      try {
        const updated = await apiClient.updateProfile(token, patch, deviceId ?? undefined);
        setProfile(updated);
      } catch (err) {
        if (await handleAuthFailure(err)) return;
        setError(err instanceof Error ? err.message : 'Unable to update profile.');
        throw err;
      }
    },
    [deviceId, handleAuthFailure, status, token],
  );

  const saveSettings = useCallback(
    async (patch: Record<string, unknown>) => {
      const currentSettings = (profile?.settings ?? {}) as Record<string, unknown>;
      await updateProfile({ settings: { ...currentSettings, ...patch } });
    },
    [profile?.settings, updateProfile],
  );

  const value = useMemo<AppDataContextValue>(
    () => ({
      profile,
      matches,
      subscription,
      loading,
      refreshing,
      error,
      refreshAll,
      respondToMatch,
      saveSettings,
      updateProfile,
    }),
    [error, loading, matches, profile, refreshAll, refreshing, respondToMatch, saveSettings, subscription, updateProfile],
  );

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}

export function useAppData() {
  const context = useContext(AppDataContext);
  if (!context) {
    throw new Error('useAppData must be used within AppDataProvider');
  }
  return context;
}
