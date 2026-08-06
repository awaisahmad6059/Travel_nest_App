import { useRouter } from "expo-router";
import { Text, View } from "react-native";

import { Button } from "@/components/ui/Button";

export default function AuthNotFound() {
  const router = useRouter();
  return (
    <View className="flex-1 bg-surface-100 items-center justify-center px-8">
      <Text className="text-2xl font-extrabold text-ink-900">Page not found</Text>
      <Text className="text-sm text-ink-500 mt-2 text-center">
        The sign-in page you're looking for doesn't exist.
      </Text>
      <Button title="Go to sign in" size="lg" block className="mt-6" onPress={() => router.replace("/")} />
    </View>
  );
}
