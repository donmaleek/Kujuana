const API_PREFIX = "/api/v1";
const LOCAL_API_ORIGIN = "http://localhost:4000";

function trimTrailingSlash(value: string): string {
  return value.replace(/\/+$/, "");
}

export function normalizeApiBase(raw?: string | null): string {
  if (!raw) return API_PREFIX;

  const trimmed = trimTrailingSlash(raw.trim());
  if (!trimmed) return API_PREFIX;
  if (trimmed.endsWith(API_PREFIX)) return trimmed;

  return `${trimmed}${API_PREFIX}`;
}

export function getApiBase(): string {
  const configured = process.env.NEXT_PUBLIC_API_URL ?? process.env.API_URL;
  if (configured) return normalizeApiBase(configured);

  // Browser requests can use Next.js rewrite proxy.
  if (typeof window !== "undefined") return API_PREFIX;

  // Server components should target the API service directly by default.
  return normalizeApiBase(LOCAL_API_ORIGIN);
}

export function buildApiUrl(path: string): string {
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${getApiBase()}${p}`;
}

export function getApiOriginForRewrite(): string {
  const configured = process.env.NEXT_PUBLIC_API_URL ?? process.env.API_URL;
  const normalized = configured ? normalizeApiBase(configured) : normalizeApiBase(LOCAL_API_ORIGIN);
  return normalized.replace(/\/api\/v1$/, "");
}
