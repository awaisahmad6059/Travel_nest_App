import "../global.css";
import { QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Component, type ReactNode, useEffect } from "react";
import { Text, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { queryClient } from "@/api/queryClient";
import { useSessionStore } from "@/auth/sessionStore";

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
        </QueryClientProvider>
      </AppErrorBoundary>
    </SafeAreaProvider>
  );
}
