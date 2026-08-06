import { useRouter } from "expo-router";
import { Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import { Button } from "@/components/ui/Button";

/**
 * Availability manager stub.
 * TODO: calendar slot blocking, blackout dates, time-slot grid.
 */
export default function AvailabilityScreen() {
  const router = useRouter();
  return (
    <SafeAreaView className="flex-1 bg-surface-100">
      <View className="flex-row items-center px-4 py-3">
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <Ionicons name="chevron-back" size={24} color="#14181f" />
        </Pressable>
        <Text className="flex-1 text-center text-base font-bold text-ink-900">
          Availability
        </Text>
        <View className="w-6" />
      </View>

      <View className="flex-1 items-center justify-center px-8">
        <View className="h-24 w-24 rounded-full bg-brand-50 items-center justify-center">
          <Ionicons name="calendar-outline" size={40} color="#0a54d9" />
        </View>
        <Text className="mt-5 text-xl font-extrabold text-ink-900">
          Manage your calendar
        </Text>
        <Text className="mt-2 text-center text-sm text-ink-500 leading-6">
          Block dates, pause slots and set lead times so travellers can only book
          when you can actually host them.
        </Text>
        <View className="mt-8 w-full gap-3">
          <Button
            title="Coming soon"
            size="lg"
            block
            onPress={() => router.back()}
          />
          <Button
            title="Back to dashboard"
            variant="secondary"
            size="lg"
            block
            onPress={() => router.replace("/")}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}
