import { Stack } from "expo-router";

export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, animation: "slide_from_right" }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="supplier-login" />
      <Stack.Screen name="supplier-signup" />
      <Stack.Screen name="pending-approval" />
      <Stack.Screen name="kyc-setup" />
    </Stack>
  );
}
