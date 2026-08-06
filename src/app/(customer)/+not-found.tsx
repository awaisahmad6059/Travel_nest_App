import { useRouter } from "expo-router";
import { Text, View } from "react-native";

import { Button } from "@/components/ui/Button";

export default function CustomerNotFound() {
  const router = useRouter();
  return (
    <View className="flex-1 bg-surface-100 items-center justify-center px-8">
      <Text className="text-2xl font-extrabold text-ink-900">Page not found</Text>
      <Text className="text-sm text-ink-500 mt-2 text-center">
        The page you're looking for isn't in the customer app.
      </Text>
      <Button title="Back to home" size="lg" block className="mt-6" onPress={() => router.replace("/")} />
    </View>
  );
}
