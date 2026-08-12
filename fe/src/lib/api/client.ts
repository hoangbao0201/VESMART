import type { ApiErrorBody, ApiSuccess } from "@/types/api";
import { getAccessToken } from "@/lib/api/token";

const DEFAULT_API_URL = "http://localhost:3001/api/v1";

export class ApiClientError extends Error {
  readonly status: number;
  readonly code: string;
  readonly details: unknown;

  constructor(
    message: string,
    options: { status: number; code: string; details?: unknown },
  ) {
    super(message);
    this.name = "ApiClientError";
    this.status = options.status;
    this.code = options.code;
    this.details = options.details ?? null;
  }
}

function getBaseUrl(): string {
  return process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") || DEFAULT_API_URL;
}

function buildUrl(path: string, query?: Record<string, string | number | boolean | undefined>): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  const url = new URL(`${getBaseUrl()}${normalized}`);

  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value === undefined) continue;
      url.searchParams.set(key, String(value));
    }
  }

  return url.toString();
}

type ApiRequestOptions = {
  query?: Record<string, string | number | boolean | undefined>;
  init?: RequestInit;
  /** Next.js fetch cache. Default: revalidate every 60s for public lists. */
  revalidate?: number | false;
  /** Attach Bearer token from localStorage (client) or explicit token. */
  auth?: boolean | string;
  body?: unknown;
  /** Skip 401 → refresh → retry (used by /auth/refresh itself). */
  skipAuthRefresh?: boolean;
};

async function parseBody<T>(response: Response): Promise<ApiSuccess<T> | ApiErrorBody | null> {
  try {
    return (await response.json()) as ApiSuccess<T> | ApiErrorBody;
  } catch {
    return null;
  }
}

function unwrapData<T>(response: Response, body: ApiSuccess<T> | ApiErrorBody | null): T {
  if (!response.ok || !body || body.success !== true) {
    const errorBody = body && body.success === false ? body : null;
    throw new ApiClientError(errorBody?.message ?? `Request failed (${response.status})`, {
      status: response.status,
      code: errorBody?.error.code ?? "REQUEST_FAILED",
      details: errorBody?.error.details ?? null,
    });
  }
  return body.data;
}

function resolveAuthHeader(auth?: boolean | string): Record<string, string> {
  if (!auth) return {};
  const token = typeof auth === "string" ? auth : getAccessToken();
  if (!token) return {};
  return { Authorization: `Bearer ${token}` };
}

/** Single-flight refresh so parallel 401s share one /auth/refresh call. */
let refreshInFlight: Promise<boolean> | null = null;

async function trySilentRefresh(): Promise<boolean> {
  if (typeof window === "undefined") return false;
  if (refreshInFlight) return refreshInFlight;
  refreshInFlight = (async () => {
    try {
      const { refreshSession } = await import("@/lib/api/auth");
      const result = await refreshSession();
      return Boolean(result?.accessToken);
    } catch {
      return false;
    } finally {
      refreshInFlight = null;
    }
  })();
  return refreshInFlight;
}

async function apiRequest<T>(
  method: string,
  path: string,
  options: ApiRequestOptions = {},
): Promise<T> {
  const {
    query,
    init,
    revalidate = method === "GET" ? 60 : false,
    auth,
    body,
    skipAuthRefresh = false,
  } = options;
  const headers: Record<string, string> = {
    Accept: "application/json",
    ...resolveAuthHeader(auth),
    ...(init?.headers as Record<string, string> | undefined),
  };

  let payload: BodyInit | undefined = init?.body ?? undefined;
  if (body !== undefined) {
    headers["Content-Type"] = "application/json";
    payload = JSON.stringify(body);
  }

  const response = await fetch(buildUrl(path, query), {
    ...init,
    method,
    headers,
    body: payload,
    ...(revalidate === false
      ? { cache: "no-store" as const }
      : { next: { revalidate } }),
  });

  const parsed = await parseBody<T>(response);
  if (!parsed) {
    throw new ApiClientError("Invalid API response", {
      status: response.status,
      code: "INVALID_RESPONSE",
    });
  }

  const shouldRefresh =
    response.status === 401 &&
    Boolean(auth) &&
    !skipAuthRefresh &&
    typeof window !== "undefined";

  if (shouldRefresh) {
    const refreshed = await trySilentRefresh();
    if (refreshed) {
      // Prefer fresh token from storage (auth may have been an expired string).
      return apiRequest<T>(method, path, {
        ...options,
        auth: options.auth ? true : options.auth,
        skipAuthRefresh: true,
      });
    }
  }

  return unwrapData(response, parsed);
}

export async function apiGet<T>(path: string, options: ApiRequestOptions = {}): Promise<T> {
  return apiRequest<T>("GET", path, options);
}

export async function apiPost<T>(path: string, options: ApiRequestOptions = {}): Promise<T> {
  return apiRequest<T>("POST", path, { ...options, revalidate: false });
}

export async function apiPatch<T>(path: string, options: ApiRequestOptions = {}): Promise<T> {
  return apiRequest<T>("PATCH", path, { ...options, revalidate: false });
}

export async function apiDelete<T>(path: string, options: ApiRequestOptions = {}): Promise<T> {
  return apiRequest<T>("DELETE", path, { ...options, revalidate: false });
}

/** Safe single-resource fetch - returns null when API is unavailable or 404. */
export async function apiGetSafe<T>(
  path: string,
  options: ApiRequestOptions = {},
): Promise<T | null> {
  try {
    return await apiGet<T>(path, options);
  } catch {
    return null;
  }
}

/** Safe list fetch for public pages - returns empty items when API is unavailable. */
export async function apiGetListSafe<T>(
  path: string,
  options: ApiRequestOptions = {},
): Promise<T[]> {
  try {
    const data = await apiGet<{ items: T[] } | T[]>(path, options);
    if (Array.isArray(data)) return data;
    return data.items ?? [];
  } catch {
    return [];
  }
}

export async function apiGetPageSafe<T>(
  path: string,
  options: ApiRequestOptions & {
    emptyPage?: number;
    emptyLimit?: number;
  } = {},
): Promise<{ items: T[]; meta: { page: number; limit: number; total: number; totalPages: number } }> {
  const page = options.emptyPage ?? 1;
  const limit = options.emptyLimit ?? 12;
  const empty = {
    items: [] as T[],
    meta: { page, limit, total: 0, totalPages: 0 },
  };

  try {
    return await apiGet(path, options);
  } catch {
    return empty;
  }
}
