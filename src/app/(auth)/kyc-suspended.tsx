import { Ionicons } from "@expo/vector-icons";
import { Text, View } from "react-native";

import { useSession } from "@/auth/sessionStore";
import { Button } from "@/components/ui/Button";
import { Screen } from "@/components/ui/Screen";

export default function KycSuspendedScreen() {
  const { signOut } = useSession();

  return (
    <Screen contentContainerClassName="flex-1 justify-center px-6 py-10">
      <View className="items-center mb-8">
        <View
          className="h-24 w-24 rounded-full items-center justify-center mb-6"
          style={{ backgroundColor: "#f1f5f9" }}
        >
          <Ionicons name="pause-circle-outline" size={48} color="#475569" />
        </View>

        <Text className="text-2xl font-extrabold text-ink-900 text-center mb-2">
          Account Suspended
        </Text>

        <Text className="text-base text-ink-500 text-center leading-6">
          Your supplier account has been permanently suspended by the administration.
        </Text>
      </View>

      <View className="bg-red-50 rounded-2xl border border-red-200 p-5 mb-6">
        <View className="flex-row items-center gap-2 mb-3">
          <Ionicons name="shield-outline" size={18} color="#dc2626" />
          <Text className="text-sm font-bold text-red-800">
            Permanent Ban
          </Text>
        </View>
        <Text className="text-sm text-red-700 leading-5">
          This email address is permanently banned from creating new accounts on TravelNest.
          Any active listings have been deactivated.
        </Text>
      </View>

      <View className="bg-ink-50 rounded-2xl p-5 mb-8">
        <View className="flex-row items-start gap-3">
          <Ionicons name="alert-circle-outline" size={18} color="#64748b" />
          <Text className="text-sm text-ink-600 leading-5 flex-1">
            If you believe this action was taken in error, please contact our support team.
          </Text>
        </View>
      </View>

      <Button
        title="Sign Out"
        size="lg"
        block
        variant="secondary"
        onPress={() => signOut()}
      />
    </Screen>
  );
}
