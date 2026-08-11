import { Stack } from "expo-router";
import { useEffect } from "react";

export default function CustomerLayout() {
  useEffect(() => {
    console.log("[NAVDEBUG] (customer) Stack MOUNTED/REMOUNTED");
  }, []);

  return (
    <Stack screenOptions={{ headerShown: false, animation: "slide_from_right" }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="listing/[id]" />
      <Stack.Screen name="checkout/travelers" />
      <Stack.Screen name="checkout/payment" />
      <Stack.Screen name="checkout/confirmation" />
      <Stack.Screen name="booking/[id]" />
    </Stack>
  );
}
