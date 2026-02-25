import Constants from 'expo-constants';
import { Platform } from 'react-native';

const DEFAULT_PORT = '4000';
const DEFAULT_PATH = '/api/v1';

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

function rewriteLoopbackIfNeeded(url: string, resolvedHost: string | null): string {
  try {
    const parsed = new URL(url);
    if (!['localhost', '127.0.0.1', '0.0.0.0'].includes(parsed.hostname)) {
      return stripTrailingSlash(parsed.toString());
    }

    if (resolvedHost) {
      parsed.hostname = resolvedHost;
      return stripTrailingSlash(parsed.toString());
    }

    if (Platform.OS === 'android') {
      parsed.hostname = '10.0.2.2';
      return stripTrailingSlash(parsed.toString());
    }

    return stripTrailingSlash(parsed.toString());
  } catch {
    return stripTrailingSlash(url);
  }
}

const resolvedHost = resolveExpoHostAddress();
const configuredApiUrl = process.env.EXPO_PUBLIC_API_URL?.trim();
const defaultApiUrl = resolvedHost
  ? `http://${resolvedHost}:${DEFAULT_PORT}${DEFAULT_PATH}`
  : Platform.OS === 'android'
    ? `http://10.0.2.2:${DEFAULT_PORT}${DEFAULT_PATH}`
    : `http://localhost:${DEFAULT_PORT}${DEFAULT_PATH}`;

const apiBaseUrl = stripTrailingSlash(
  configuredApiUrl ? rewriteLoopbackIfNeeded(configuredApiUrl, resolvedHost) : defaultApiUrl,
);

export const ENV = {
  apiBaseUrl,
  pushProjectId: process.env.EXPO_PUBLIC_PUSH_PROJECT_ID,
};
