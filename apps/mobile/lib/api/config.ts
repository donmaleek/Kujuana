import Constants from 'expo-constants';
import { Platform } from 'react-native';

const DEFAULT_API_PORT = '4000';
const DEFAULT_API_PATH = '/api/v1';
const DEFAULT_WEB_PORT = '3000';

function stripTrailingSlash(value: string): string {
  return value.replace(/\/+$/, '');
}

function resolveExpoHostAddress(): string | null {
  const candidates = [
    Constants.expoConfig?.hostUri,
    (Constants as { manifest?: { debuggerHost?: string } }).manifest?.debuggerHost,
    (
      Constants as {
        manifest2?: {
          extra?: {
            expoGo?: { debuggerHost?: string };
            expoClient?: { hostUri?: string };
          };
        };
      }
    ).manifest2?.extra?.expoGo?.debuggerHost,
    (
      Constants as {
        manifest2?: { extra?: { expoClient?: { hostUri?: string } } };
      }
    ).manifest2?.extra?.expoClient?.hostUri,
  ];

  for (const candidate of candidates) {
    if (!candidate) continue;
    const host = candidate.split('/')[0]?.split(':')[0]?.trim();
    if (!host) continue;
    if (host === 'localhost' || host === '127.0.0.1' || host === '0.0.0.0') continue;
    return host;
  }

  return null;
}

function normalizeApiUrl(url: string, resolvedHost: string | null): string {
  try {
    const parsed = new URL(url);

    if (['localhost', '127.0.0.1', '0.0.0.0'].includes(parsed.hostname)) {
      if (resolvedHost) {
        parsed.hostname = resolvedHost;
      } else if (Platform.OS === 'android') {
        parsed.hostname = '10.0.2.2';
      }
    }

    if (!parsed.pathname || parsed.pathname === '/') {
      parsed.pathname = DEFAULT_API_PATH;
    }

    return stripTrailingSlash(parsed.toString());
  } catch {
    return stripTrailingSlash(url);
  }
}

const resolvedHost = resolveExpoHostAddress();
const configuredApiUrlRaw = (globalThis as {
  process?: { env?: Record<string, string | undefined> };
}).process?.env?.EXPO_PUBLIC_API_URL;
const configuredApiUrl = typeof configuredApiUrlRaw === 'string' ? configuredApiUrlRaw.trim() : '';
const configuredWebUrlRaw = (globalThis as {
  process?: { env?: Record<string, string | undefined> };
}).process?.env?.EXPO_PUBLIC_WEB_URL;
const configuredWebUrl = typeof configuredWebUrlRaw === 'string' ? configuredWebUrlRaw.trim() : '';

const defaultApiUrl = resolvedHost
  ? `http://${resolvedHost}:${DEFAULT_API_PORT}${DEFAULT_API_PATH}`
  : Platform.OS === 'android'
    ? `http://10.0.2.2:${DEFAULT_API_PORT}${DEFAULT_API_PATH}`
    : `http://localhost:${DEFAULT_API_PORT}${DEFAULT_API_PATH}`;

const defaultWebUrl = resolvedHost
  ? `http://${resolvedHost}:${DEFAULT_WEB_PORT}`
  : Platform.OS === 'android'
    ? `http://10.0.2.2:${DEFAULT_WEB_PORT}`
    : `http://localhost:${DEFAULT_WEB_PORT}`;

export const API_CONFIG = {
  baseUrl: configuredApiUrl ? normalizeApiUrl(configuredApiUrl, resolvedHost) : defaultApiUrl,
  webUrl: configuredWebUrl ? stripTrailingSlash(normalizeApiUrl(configuredWebUrl, resolvedHost).replace(/\/api\/v1$/, '')) : defaultWebUrl,
};
