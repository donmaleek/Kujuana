import * as Crypto from 'expo-crypto';
import * as SecureStore from 'expo-secure-store';

const ACCESS_TOKEN_KEY = 'kujuana_access_token';
const USER_ID_KEY = 'kujuana_user_id';
const DEVICE_ID_KEY = 'kujuana_device_id';

export async function persistSession(accessToken: string, userId: string): Promise<void> {
  await Promise.all([
    SecureStore.setItemAsync(ACCESS_TOKEN_KEY, accessToken),
    SecureStore.setItemAsync(USER_ID_KEY, userId),
  ]);
}

export async function updateStoredAccessToken(accessToken: string): Promise<void> {
  await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, accessToken);
}

export async function loadSession(): Promise<{ accessToken: string | null; userId: string | null }> {
  const [accessToken, userId] = await Promise.all([
    SecureStore.getItemAsync(ACCESS_TOKEN_KEY),
    SecureStore.getItemAsync(USER_ID_KEY),
  ]);

  return { accessToken, userId };
}

export async function clearSessionStorage(): Promise<void> {
  await Promise.all([
    SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY),
    SecureStore.deleteItemAsync(USER_ID_KEY),
  ]);
}

export async function getOrCreateDeviceId(): Promise<string> {
  const existing = await SecureStore.getItemAsync(DEVICE_ID_KEY);
  if (existing) return existing;

  const generated = Crypto.randomUUID();
  await SecureStore.setItemAsync(DEVICE_ID_KEY, generated);

  return generated;
}
