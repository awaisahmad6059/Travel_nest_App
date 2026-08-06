import "../global.css";
import { QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { queryClient } from "@/api/queryClient";
import { useSessionStore } from "@/auth/sessionStore";

SplashScreen.preventAutoHideAsync();

/**
 * Root navigator.
 *
 * Single app, role-based panels:
 *  - signed out  -> (auth)    [Login / Signup]
 *  - customer    -> (customer) [Home, Search, Bookings, ...]
 *  - supplier    -> (supplier) [Dashboard, Inbox, ...]
 *
 * Stack.Protected only registers one panel at a time, so a customer can never
 * reach supplier screens and vice versa. When the guard flips (login/logout)
 * the router redirects to the first available screen automatically.
 */
export default function RootLayout() {
  const status = useSessionStore((s) => s.status);
  const role = useSessionStore((s) => s.user?.role ?? null);
  const hydrate = useSessionStore((s) => s.hydrate);

  useEffect(() => {
    void hydrate().finally(() => SplashScreen.hideAsync());
  }, [hydrate]);

  // Native splash stays up while we restore the session from secure storage.
  if (status === "idle") {
    return null;
  }

  const isAuthed = status === "authenticated";

  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <StatusBar style="dark" />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Protected guard={isAuthed && role === "customer"}>
            <Stack.Screen name="(customer)" />
          </Stack.Protected>
          <Stack.Protected guard={isAuthed && role === "supplier"}>
            <Stack.Screen name="(supplier)" />
          </Stack.Protected>
          <Stack.Protected guard={!isAuthed}>
            <Stack.Screen name="(auth)" />
          </Stack.Protected>
        </Stack>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
