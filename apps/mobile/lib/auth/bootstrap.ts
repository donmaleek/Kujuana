import { ApiError } from '@/lib/api/types';
import { getAuthSession, getMyProfile, loginUser, logoutUser } from '@/lib/api/endpoints';
import { clearSessionStorage, getOrCreateDeviceId, loadSession, persistSession } from '@/lib/auth/secure-session';
import { useAuthStore } from '@/store/auth-store';
import type { ProfileMe } from '@/lib/api/types';

function normalizeProfile(raw: ProfileMe): ProfileMe {
  const completenessInput = (raw as ProfileMe & { completeness: ProfileMe['completeness'] | number }).completeness;
  const baseOverall =
    typeof completenessInput === 'number'
      ? completenessInput
      : (completenessInput?.overall ?? 0);

  const completeness =
    typeof completenessInput === 'number'
      ? {
          basic: false,
          background: false,
          photos: false,
          vision: false,
          preferences: false,
          overall: baseOverall,
        }
      : completenessInput;

  return {
    ...raw,
    completeness,
    profileCompleteness:
      typeof raw.profileCompleteness === 'number' ? raw.profileCompleteness : baseOverall,
  };
}

export async function hydrateSession(): Promise<void> {
  const deviceId = await getOrCreateDeviceId();
  useAuthStore.getState().setDeviceId(deviceId);

  const { accessToken, userId } = await loadSession();
  if (!accessToken || !userId) {
    useAuthStore.getState().setSignedOut();
    return;
  }

  useAuthStore.getState().setSignedIn(accessToken, userId);
  try {
    const session = await getAuthSession();
    useAuthStore.getState().setRole(session.role);
  } catch {
    // Continue with user role fallback if session lookup fails.
  }
  await refreshProfile();
}

export async function refreshProfile(): Promise<void> {
  useAuthStore.getState().setProfileLoading(true);

  try {
    const profile = await getMyProfile();
    useAuthStore.getState().setProfile(normalizeProfile(profile));
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      useAuthStore.getState().setProfile(null);
    } else if (error instanceof ApiError && error.status === 401) {
      await clearSessionStorage();
      useAuthStore.getState().setSignedOut();
      return;
    } else {
      throw error;
    }
  } finally {
    useAuthStore.getState().setProfileLoading(false);
  }
}

export async function signInWithPassword(input: { email: string; password: string }): Promise<void> {
  const response = await loginUser(input);
  useAuthStore.getState().setSignedIn(response.accessToken, response.userId, response.user?.role ?? 'user');
  await persistSession(response.accessToken, response.userId);
  await refreshProfile();
}

export async function signOut(): Promise<void> {
  try {
    await logoutUser();
  } catch {
    // Ignore logout network errors to avoid trapping the user in a broken local session.
  }

  await clearSessionStorage();
  useAuthStore.getState().setSignedOut();
}
