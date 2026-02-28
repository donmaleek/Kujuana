// kujuana/apps/web/lib/api-client.ts
import { z } from "zod";
import { getApiBase } from "./api-base";

const API_BASE = getApiBase();

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

type RequestOptions = {
  headers?: Record<string, string>;
  signal?: AbortSignal;
  // When using cookie-based auth:
  credentials?: RequestCredentials;
};

function buildUrl(path: string) {
  const base = (API_BASE ?? "").replace(/\/$/, "");
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${base}${p}`;
}

async function request<T>(
  method: HttpMethod,
  path: string,
  body?: unknown,
  options?: RequestOptions,
  responseSchema?: z.ZodTypeAny
): Promise<T> {
  const url = buildUrl(path);

  const res = await fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers ?? {}),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
    credentials: options?.credentials ?? "include",
    signal: options?.signal,
  });

  const text = await res.text();
  const json = text ? (() => { try { return JSON.parse(text); } catch { return text; } })() : null;

  if (!res.ok) {
    const message =
      typeof json === "object" && typeof json?.error === "string"
        ? String(json.error)
        : typeof json === "object" && json?.error?.message
        ? String(json.error.message)
        : typeof json === "string"
        ? json
        : `Request failed (${res.status})`;

    const code =
      typeof json === "object" && json?.error?.code ? String(json.error.code) : "REQUEST_FAILED";

    const err = new Error(message) as Error & { status?: number; code?: string; payload?: any };
    err.status = res.status;
    err.code = code;
    err.payload = json;
    throw err;
  }

  const data = json as T;

  if (responseSchema) {
    const parsed = responseSchema.safeParse(data);
    if (!parsed.success) {
      const err = new Error("Invalid response from server.") as Error & { issues?: any };
      err.issues = parsed.error.issues;
      throw err;
    }
    return parsed.data as T;
  }

  return data;
}

export const apiClient = {
  get: <T>(path: string, options?: RequestOptions, schema?: z.ZodTypeAny) =>
    request<T>("GET", path, undefined, options, schema),
  post: <T>(path: string, body?: unknown, options?: RequestOptions, schema?: z.ZodTypeAny) =>
    request<T>("POST", path, body, options, schema),
  put: <T>(path: string, body?: unknown, options?: RequestOptions, schema?: z.ZodTypeAny) =>
    request<T>("PUT", path, body, options, schema),
  patch: <T>(path: string, body?: unknown, options?: RequestOptions, schema?: z.ZodTypeAny) =>
    request<T>("PATCH", path, body, options, schema),
  del: <T>(path: string, options?: RequestOptions, schema?: z.ZodTypeAny) =>
    request<T>("DELETE", path, undefined, options, schema),
};
