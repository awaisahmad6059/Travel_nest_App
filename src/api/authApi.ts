import { USE_MOCKS_AUTH } from "@/config";
import { request, mockDelay } from "./client";
import { DEMO_ACCOUNTS } from "@/mocks/users";
import { userDtoToUser, UserDTO } from "./contracts";
import type { AuthSession, SignInInput, SignUpInput, User } from "@/types";

/**
 * Auth service (API_HANDOFF.md §5.1 — planned). Today it resolves mock
 * sessions; the real branches follow the planned routes:
 *   POST /auth/login | POST /auth/register | POST /auth/refresh | GET /users/me
 *
 * Demo accounts (any password works):
 *   customer@demo.com -> Customer Panel
 *   supplier@demo.com -> Supplier Panel
 */

interface AuthResponseDTO {
  access_token: string;
  refresh_token: string;
  user?: UserDTO;
}

function toSession(dto: AuthResponseDTO, fallbackRole: "customer" | "supplier"): AuthSession {
  const user: User = dto.user
    ? userDtoToUser(dto.user)
    : {
        id: "me",
        name: "Traveler",
        email: "",
        role: fallbackRole,
        avatarEmoji: fallbackRole === "supplier" ? "🏔️" : "🧳",
      };
  return {
    accessToken: dto.access_token,
    refreshToken: dto.refresh_token,
    user,
  };
}

export const authApi = {
  async signIn(input: SignInInput): Promise<AuthSession> {
    if (USE_MOCKS_AUTH) {
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
    const dto = await request<AuthResponseDTO>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email: input.email, password: input.password }),
    });
    return toSession(dto, "customer");
  },

  async signUp(input: SignUpInput): Promise<AuthSession> {
    if (USE_MOCKS_AUTH) {
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
    const dto = await request<AuthResponseDTO>("/auth/register", {
      method: "POST",
      body: JSON.stringify({
        name: input.name,
        email: input.email,
        password: input.password,
        role: input.role,
      }),
    });
    return toSession(dto, input.role);
  },

  /** Rotates an expired access token using the refresh token. */
  async refresh(refreshToken: string): Promise<AuthSession> {
    const dto = await request<AuthResponseDTO>("/auth/refresh", {
      method: "POST",
      body: JSON.stringify({ refresh_token: refreshToken }),
    });
    return toSession(dto, "customer");
  },

  /** Fetches the current profile — called with the stored access token. */
  async getMe(): Promise<User> {
    const dto = await request<UserDTO>("/users/me");
    return userDtoToUser(dto);
  },

  async signOut(): Promise<void> {
    if (USE_MOCKS_AUTH) {
      return mockDelay(undefined, 200);
    }
    // No logout route in the handoff — tokens are dropped client-side.
    return Promise.resolve();
  },

  async requestPasswordReset(email: string): Promise<void> {
    if (USE_MOCKS_AUTH) {
      return mockDelay(undefined, 600);
    }
    await request("/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    });
  },
};
