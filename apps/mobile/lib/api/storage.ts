import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const STORAGE_KEYS = {
  accessToken: 'kujuana_access_token',
  deviceId: 'kujuana_device_id',
} as const;

function randomId(prefix: string): string {
  const randomValue =
    typeof globalThis.crypto?.randomUUID === 'function'
      ? globalThis.crypto.randomUUID().replace(/-/g, '')
      : `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 12)}`;
  return `${prefix}-${randomValue}`;
}

async function readFromStorage(key: string): Promise<string | null> {
  if (Platform.OS === 'web') {
    return globalThis.localStorage?.getItem(key) ?? null;
  }
  return SecureStore.getItemAsync(key);
}

async function writeToStorage(key: string, value: string): Promise<void> {
  if (Platform.OS === 'web') {
    globalThis.localStorage?.setItem(key, value);
    return;
  }
  await SecureStore.setItemAsync(key, value);
}

async function removeFromStorage(key: string): Promise<void> {
  if (Platform.OS === 'web') {
    globalThis.localStorage?.removeItem(key);
    return;
  }
  await SecureStore.deleteItemAsync(key);
}

export async function getStoredAccessToken(): Promise<string | null> {
  return readFromStorage(STORAGE_KEYS.accessToken);
}

export async function setStoredAccessToken(token: string): Promise<void> {
  await writeToStorage(STORAGE_KEYS.accessToken, token);
}

export async function clearStoredAccessToken(): Promise<void> {
  await removeFromStorage(STORAGE_KEYS.accessToken);
}

export async function getOrCreateDeviceId(): Promise<string> {
  const existing = await readFromStorage(STORAGE_KEYS.deviceId);
  if (existing && existing.trim().length > 0) return existing;

  const created = randomId('mobile');
  await writeToStorage(STORAGE_KEYS.deviceId, created);
  return created;
}
