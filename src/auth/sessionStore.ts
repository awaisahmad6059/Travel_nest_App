import { create } from "zustand";
import type { AuthSession, User } from "@/types";
import { secureStorage } from "./secureStorage";
import { authApi } from "@/api/authApi";
import { setAccessToken } from "@/api/client";

export type SessionStatus = "idle" | "loading" | "authenticated" | "signedOut";

interface SessionState {
  status: SessionStatus;
  session: AuthSession | null;
  user: User | null;
  hydrate: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (input: {
    name: string;
    email: string;
    password: string;
    role: User["role"];
  }) => Promise<void>;
  signOut: () => Promise<void>;
}

function persist(session: AuthSession | null) {
  setAccessToken(session?.accessToken ?? null);
  if (session) {
    void secureStorage.saveSession(JSON.stringify(session));
  } else {
    void secureStorage.clearSession();
  }
}

export const useSessionStore = create<SessionState>((set, get) => ({
  status: "idle",
  session: null,
  user: null,

  async hydrate() {
    if (get().status !== "idle") return;
    set({ status: "loading" });
    try {
      const raw = await secureStorage.loadSession();
      if (raw) {
        const session = JSON.parse(raw) as AuthSession;
        persist(session);
        set({ session, user: session.user, status: "authenticated" });
        return;
      }
      set({ session: null, user: null, status: "signedOut" });
    } catch {
      set({ session: null, user: null, status: "signedOut" });
    }
  },

  async signIn(email: string, password: string) {
    const session = await authApi.signIn({ email, password });
    persist(session);
    set({ session, user: session.user, status: "authenticated" });
  },

  async signUp(input) {
    const session = await authApi.signUp({
      ...input,
      email: input.email,
      password: input.password,
      role: input.role,
    });
    persist(session);
    set({ session, user: session.user, status: "authenticated" });
  },

  async signOut() {
    try {
      await authApi.signOut();
    } finally {
      persist(null);
      set({ session: null, user: null, status: "signedOut" });
    }
  },
}));

/** Convenience selector for UI: { status, user } and role helpers. */
export function useSession() {
  const status = useSessionStore((s) => s.status);
  const user = useSessionStore((s) => s.user);
  const signIn = useSessionStore((s) => s.signIn);
  const signUp = useSessionStore((s) => s.signUp);
  const signOut = useSessionStore((s) => s.signOut);
  const hydrate = useSessionStore((s) => s.hydrate);
  return { status, user, role: user?.role ?? null, signIn, signUp, signOut, hydrate };
}
