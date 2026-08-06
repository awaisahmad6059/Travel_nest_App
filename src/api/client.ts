import { API_BASE_URL } from "@/config";

/**
 * Thin HTTP client for the TravelNest REST API.
 *
 * Today the app runs on mock data (USE_MOCKS in src/config.ts), so services
 * mostly don't hit this function. When the real backend docs arrive, the
 * `request` helper below is the single place that talks to the network —
 * interceptors for auth headers and token refresh live here.
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
  const res = await fetch(`${API_BASE_URL}${path}`, opts);
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new ApiError(res.status, body || `Request failed (${res.status})`);
  }
  return (await res.json()) as T;
}

/** Simulated network latency so loading states are visible in the demo. */
export function mockDelay<T>(data: T, ms = 450): Promise<T> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(structuredClone(data)), ms);
  });
}
