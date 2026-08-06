import { USE_MOCKS } from "@/config";
import { request, mockDelay } from "./client";
import { DEMO_ACCOUNTS } from "@/mocks/users";
import type { AuthSession, SignInInput, SignUpInput } from "@/types";

/**
 * Auth service. Today it resolves mock sessions; when the real Auth module
 * docs arrive, replace the mock branch with `request('/auth/login', ...)`.
 *
 * Demo accounts (any password works):
 *   customer@demo.com -> Customer Panel
 *   supplier@demo.com -> Supplier Panel
 */
export const authApi = {
  async signIn(input: SignInInput): Promise<AuthSession> {
    if (USE_MOCKS) {
      const user = DEMO_ACCOUNTS.find(
        (u) => u.email.toLowerCase() === input.email.trim().toLowerCase(),
      );
      if (!user) {
        throw new Error(
          "No demo account for this email. Use customer@demo.com or supplier@demo.com (any password).",
        );
      }
      return mockDelay({
        accessToken: `mock-access-${user.id}-${Date.now()}`,
        refreshToken: `mock-refresh-${user.id}`,
        user,
      });
    }
    return request<AuthSession>("/auth/login", {
      method: "POST",
      body: JSON.stringify(input),
    });
  },

  async signUp(input: SignUpInput): Promise<AuthSession> {
    if (USE_MOCKS) {
      return mockDelay({
        accessToken: `mock-access-new-${Date.now()}`,
        refreshToken: `mock-refresh-new`,
        user: {
          id: `u_${Date.now()}`,
          name: input.name,
          email: input.email,
          role: input.role,
          avatarEmoji: input.role === "supplier" ? "🏔️" : "🧳",
        },
      });
    }
    return request<AuthSession>("/auth/register", {
      method: "POST",
      body: JSON.stringify(input),
    });
  },

  async signOut(): Promise<void> {
    if (USE_MOCKS) {
      return mockDelay(undefined, 200);
    }
    await request("/auth/logout", { method: "POST" });
  },

  async requestPasswordReset(email: string): Promise<void> {
    if (USE_MOCKS) {
      return mockDelay(undefined, 600);
    }
    await request("/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    });
  },
};
