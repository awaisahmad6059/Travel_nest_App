import { API_BASE_URL } from "@/config";

/**
 * Thin HTTP client for the TravelNest REST API.
 *
 * Each domain has its own mock switch in src/config.ts; services whose flag
 * is off hit the production backend through `request` below — interceptors
 * for auth headers and token refresh live here.
 */

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

/** How long a single request may take before it is aborted. Generous because
 * the free-tier Render backend cold-starts on the first hit (~20-30s). */
export const REQUEST_TIMEOUT_MS = 30_000;

/**
 * Thrown when a request exceeds REQUEST_TIMEOUT_MS. Most often this is a
 * sleeping backend (cold start) rather than a real failure, so callers can
 * detect it with `isTimeoutError` and show the cold-start banner instead of a
 * generic error.
 */
export class ApiTimeoutError extends ApiError {
  constructor(message = "The server took too long to respond.") {
    super(0, message);
    this.name = "ApiTimeoutError";
  }
}

export function isTimeoutError(err: unknown): boolean {
  return err instanceof ApiTimeoutError;
}

let accessToken: string | null = null;

/** Called by the auth store whenever a session is established/cleared. */
export function setAccessToken(token: string | null) {
  accessToken = token;
}

/** Placeholder interceptor queue — extend with refresh-on-401 later. */
async function withAuth(options: RequestInit): Promise<RequestInit> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (accessToken) headers.Authorization = `Bearer ${accessToken}`;
  return { ...options, headers };
}

export async function request<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const opts = await withAuth(options);
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const res = await fetch(`${API_BASE_URL}${path}`, {
      ...opts,
      signal: controller.signal,
    });
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      throw new ApiError(res.status, body || `Request failed (${res.status})`);
    }
    return (await res.json()) as T;
  } catch (err) {
    if (err instanceof Error && err.name === "AbortError") {
      throw new ApiTimeoutError();
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }
}

/** Simulated network latency so loading states are visible in the demo. */
export function mockDelay<T>(data: T, ms = 450): Promise<T> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(structuredClone(data)), ms);
  });
}
