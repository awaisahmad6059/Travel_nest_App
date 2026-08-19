import { Stack } from "expo-router";
import { useKycForegroundCheck } from "@/features/supplier/useKycForegroundCheck";

export default function SupplierLayout() {
  useKycForegroundCheck();

  return (
    <Stack screenOptions={{ headerShown: false, animation: "slide_from_right" }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="booking/[id]" />
      <Stack.Screen name="availability" />
    </Stack>
  );
}
