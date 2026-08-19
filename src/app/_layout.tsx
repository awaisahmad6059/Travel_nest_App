import "../global.css";
import { QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Component, type ReactNode, useEffect, useRef, useState } from "react";
import { ActivityIndicator, AppState, type AppStateStatus, Text, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { queryClient } from "@/api/queryClient";
import { useSessionStore } from "@/auth/sessionStore";
import PendingApprovalScreen from "./(auth)/pending-approval";
import KycRejectedScreen from "./(auth)/kyc-rejected";
import ActionRequiredScreen from "./(auth)/kyc-action-required";
import KycSuspendedScreen from "./(auth)/kyc-suspended";

class AppErrorBoundary extends Component<
  { children: ReactNode },
  { error: Error | null }
> {
  state = { error: null as Error | null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <View
          style={{
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
            padding: 24,
            backgroundColor: "#ffffff",
          }}
        >
          <Text style={{ fontSize: 18, fontWeight: "bold", color: "#dc2626" }}>
            RENDER ERROR
          </Text>
          <Text style={{ marginTop: 12, color: "#111111", textAlign: "center" }}>
            {String(this.state.error?.message ?? this.state.error)}
          </Text>
          <Text style={{ marginTop: 8, color: "#555555", fontSize: 12 }}>
            {String(this.state.error?.stack ?? "")}
          </Text>
        </View>
      );
    }
    return this.props.children;
  }
}

function SupplierKycGate({ children }: { children: ReactNode }) {
  const user = useSessionStore((s) => s.user);
  const [kycStatus, setKycStatus] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string[]>([]);
  const [checking, setChecking] = useState(true);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchStatus = useRef(async () => {
    if (!user || user.role !== "supplier") return;
    try {
      const kyResp = await fetch(
        "https://travelnest-jet.vercel.app/api/admin/kyc",
      );
      if (!kyResp.ok) return;

      const allKyc: Array<{
        user_id: string;
        status: string;
        audit_reasons: unknown;
      }> = await kyResp.json();

      const myKyc = allKyc.find((r) => r.user_id === user.id);
      if (myKyc) {
        setKycStatus(myKyc.status);
        setFeedback(
          Array.isArray(myKyc.audit_reasons) ? myKyc.audit_reasons : [],
        );
      }
    } catch (e) {
      console.error("[KYC GATE] check failed", e);
    }
  });

  // Initial fetch
  useEffect(() => {
    if (!user || user.role !== "supplier") return;
    (async () => {
      await fetchStatus.current();
      setChecking(false);
    })();
  }, [user]);

  // Foreground listener — always re-check
  useEffect(() => {
    if (!user || user.role !== "supplier") return;

    const sub = AppState.addEventListener("change", (state: AppStateStatus) => {
      if (state === "active") {
        void fetchStatus.current();
      }
    });
    return () => sub.remove();
  }, [user]);

  // Periodic check every 10s — always run for suppliers (approved or not)
  useEffect(() => {
    if (!user || user.role !== "supplier") return;
    timerRef.current = setInterval(() => {
      void fetchStatus.current();
    }, 10000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [user]);

  if (checking && user?.role === "supplier") {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#7c3aed" />
        <Text style={{ marginTop: 12, color: "#555" }}>
          Verifying account...
        </Text>
      </View>
    );
  }

  if (kycStatus && kycStatus !== "APPROVED" && user?.role === "supplier") {
    if (kycStatus === "PENDING") return <PendingApprovalScreen />;
    if (kycStatus === "REJECTED") return <KycRejectedScreen feedback={feedback} />;
    if (kycStatus === "CHANGES_REQUESTED")
      return <ActionRequiredScreen feedback={feedback} userId={user.id} />;
    if (kycStatus === "SUSPENDED") return <KycSuspendedScreen />;
  }

  return <>{children}</>;
}

export default function RootLayout() {
  const status = useSessionStore((s) => s.status);
  const user = useSessionStore((s) => s.user);
  const hydrate = useSessionStore((s) => s.hydrate);

  useEffect(() => {
    void hydrate().catch(() => undefined);
  }, [hydrate]);

  // While the session restores, keep a non-empty frame so Expo Go hides its
  // native splash (expo-splash-screen's JS API is a no-op inside Expo Go).
  if (status === "idle" || status === "loading") {
    return (
      <SafeAreaProvider>
        <View style={{ flex: 1 }} />
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <AppErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <StatusBar style="dark" />
          <SupplierKycGate>
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Protected guard={!user}>
                <Stack.Screen name="(auth)" />
              </Stack.Protected>
              <Stack.Protected guard={user?.role === "customer"}>
                <Stack.Screen name="(customer)" />
              </Stack.Protected>
              <Stack.Protected guard={user?.role === "supplier"}>
                <Stack.Screen name="(supplier)" />
              </Stack.Protected>
            </Stack>
          </SupplierKycGate>
        </QueryClientProvider>
      </AppErrorBoundary>
    </SafeAreaProvider>
  );
}
