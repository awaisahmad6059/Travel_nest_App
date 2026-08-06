import { Stack } from "expo-router";

export default function CustomerLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, animation: "slide_from_right" }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="listing/[id]" />
      <Stack.Screen name="checkout/index" />
      <Stack.Screen name="checkout/travelers" />
      <Stack.Screen name="checkout/payment" />
      <Stack.Screen name="checkout/confirmation" />
      <Stack.Screen name="booking/[id]" />
    </Stack>
  );
}
