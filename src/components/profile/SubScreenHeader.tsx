import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Pressable, Text, View } from "react-native";

/** Shared header for the Profile sub-screens (back chevron + centered title). */
export function SubScreenHeader({ title }: { title: string }) {
  const router = useRouter();
  return (
    <View className="flex-row items-center px-4 py-3">
      <Pressable onPress={() => router.back()} hitSlop={8}>
        <Ionicons name="chevron-back" size={24} color="#14181f" />
      </Pressable>
      <Text className="flex-1 text-center text-base font-bold text-ink-900">{title}</Text>
      <View className="w-6" />
    </View>
  );
}
