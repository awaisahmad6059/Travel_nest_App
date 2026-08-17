import { USE_MOCKS_AUTH } from "@/config";
import { mockDelay } from "./client";
import { DEMO_ACCOUNTS } from "@/mocks/users";
import { supabase } from "@/lib/supabase";
import type { AuthSession, SignInInput, SignUpInput, User } from "@/types";

/**
 * Auth service — mocks for demo, Supabase Auth for real login.
 */

function supabaseUserToUser(su: {
  id: string;
  email?: string;
  user_metadata?: Record<string, unknown>;
}): User {
  const meta = su.user_metadata ?? {};
  const role: User["role"] =
    (meta.role as User["role"]) ?? "customer";
  return {
    id: su.id,
    name: (meta.full_name as string) ?? (meta.name as string) ?? "User",
    email: su.email ?? "",
    role,
    avatarEmoji: role === "supplier" ? "🏔️" : "🧳",
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

    const { data, error } = await supabase.auth.signInWithPassword({
      email: input.email.trim(),
      password: input.password,
    });
    if (error) throw new Error(error.message);
    if (!data.user || !data.session) throw new Error("Login failed.");

    const user = supabaseUserToUser(data.user);
    return {
      accessToken: data.session.access_token,
      refreshToken: data.session.refresh_token,
      user,
    };
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

    const { data, error } = await supabase.auth.signUp({
      email: input.email.trim(),
      password: input.password,
      options: {
        data: { full_name: input.name, role: input.role },
      },
    });
    if (error) throw new Error(error.message);
    if (!data.user) throw new Error("Sign up failed.");

    const user: User = {
      id: data.user.id,
      name: input.name,
      email: input.email,
      role: input.role,
      avatarEmoji: input.role === "supplier" ? "🏔️" : "🧳",
    };

    if (data.session) {
      return {
        accessToken: data.session.access_token,
        refreshToken: data.session.refresh_token,
        user,
      };
    }

    return {
      accessToken: "",
      refreshToken: "",
      user,
    };
  },

  async refresh(refreshToken: string): Promise<AuthSession> {
    if (USE_MOCKS_AUTH) {
      return mockDelay({
        accessToken: "mock-access-refreshed",
        refreshToken: "mock-refresh-new",
        user: DEMO_ACCOUNTS[0],
      });
    }

    const { data, error } = await supabase.auth.refreshSession();
    if (error) throw new Error(error.message);
    if (!data.user || !data.session) throw new Error("Session refresh failed.");

    const user = supabaseUserToUser(data.user);
    return {
      accessToken: data.session.access_token,
      refreshToken: data.session.refresh_token,
      user,
    };
  },

  async getMe(): Promise<User> {
    if (USE_MOCKS_AUTH) {
      return DEMO_ACCOUNTS[0];
    }

    const { data, error } = await supabase.auth.getUser();
    if (error) throw new Error(error.message);
    if (!data.user) throw new Error("Not authenticated.");

    return supabaseUserToUser(data.user);
  },

  async signOut(): Promise<void> {
    if (USE_MOCKS_AUTH) {
      return mockDelay(undefined, 200);
    }
    await supabase.auth.signOut();
  },

  async requestPasswordReset(email: string): Promise<void> {
    if (USE_MOCKS_AUTH) {
      return mockDelay(undefined, 600);
    }
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: "travelnest://reset-password",
    });
    if (error) throw new Error(error.message);
  },
};
