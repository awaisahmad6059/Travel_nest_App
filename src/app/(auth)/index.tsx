import { useRouter } from "expo-router";
import { Pressable, Text, View } from "react-native";

import { useSession } from "@/auth/sessionStore";
import { Button } from "@/components/ui/Button";
import { Screen } from "@/components/ui/Screen";

export default function LoginScreen() {
  const router = useRouter();
  const { continueAsGuest } = useSession();

  return (
    <Screen contentContainerClassName="flex-1 justify-center px-6 py-10">
      <View className="items-center mb-10">
        <View className="h-20 w-20 rounded-3xl bg-brand-500 items-center justify-center mb-4">
          <Text className="text-4xl">🧳</Text>
        </View>
        <Text className="text-3xl font-extrabold text-ink-900 text-center">
          TravelNest
        </Text>
        <Text className="text-lg text-ink-600 mt-2 text-center">
          Discover & book experiences worldwide
        </Text>
      </View>

      <View className="gap-4">
        <Button
          title="Continue as Traveller"
          size="lg"
          block
          onPress={continueAsGuest}
        />

        <View className="items-center mt-2">
          <Text className="text-xs text-ink-400">
            Browse, search & explore — no account needed
          </Text>
        </View>
      </View>

      <View className="items-center mt-10 pt-6 border-t border-ink-100">
        <Text className="text-ink-500 text-sm mb-2">Are you a tour operator?</Text>
        <Pressable onPress={() => router.push("/supplier-login")}>
          <Text className="text-base font-bold" style={{ color: "#7c3aed" }}>
            Supplier Portal
          </Text>
        </Pressable>
      </View>
    </Screen>
  );
}
