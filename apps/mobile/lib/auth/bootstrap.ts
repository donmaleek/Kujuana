import { ApiError } from '@/lib/api/types';
import { getMyProfile, loginUser, logoutUser } from '@/lib/api/endpoints';
import { clearSessionStorage, getOrCreateDeviceId, loadSession, persistSession } from '@/lib/auth/secure-session';
import { useAuthStore } from '@/store/auth-store';

export async function hydrateSession(): Promise<void> {
  const deviceId = await getOrCreateDeviceId();
  useAuthStore.getState().setDeviceId(deviceId);

  const { accessToken, userId } = await loadSession();
  if (!accessToken || !userId) {
    useAuthStore.getState().setSignedOut();
    return;
  }

  useAuthStore.getState().setSignedIn(accessToken, userId);
  await refreshProfile();
}

export async function refreshProfile(): Promise<void> {
  useAuthStore.getState().setProfileLoading(true);

  try {
    const profile = await getMyProfile();
    useAuthStore.getState().setProfile(profile);
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
  useAuthStore.getState().setSignedIn(response.accessToken, response.userId);
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
