import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Text, View } from "react-native";

import { useSession } from "@/auth/sessionStore";
import { Button } from "@/components/ui/Button";
import { Screen } from "@/components/ui/Screen";

export default function PendingApprovalScreen() {
  const router = useRouter();
  const { signOut } = useSession();

  async function handleLogout() {
    await signOut();
  }

  return (
    <Screen contentContainerClassName="flex-1 justify-center px-6 py-10">
      <View className="items-center mb-8">
        <View
          className="h-24 w-24 rounded-full items-center justify-center mb-6"
          style={{ backgroundColor: "#fef3c7" }}
        >
          <Ionicons name="time-outline" size={48} color="#d97706" />
        </View>

        <Text className="text-2xl font-extrabold text-ink-900 text-center mb-2">
          Account Under Review
        </Text>

        <Text className="text-base text-ink-500 text-center leading-6">
          Your KYC verification documents have been submitted successfully.
        </Text>
      </View>

      <View className="bg-amber-50 rounded-2xl border border-amber-200 p-5 mb-8">
        <View className="flex-row items-center gap-2 mb-3">
          <Ionicons name="shield-checkmark-outline" size={20} color="#d97706" />
          <Text className="text-sm font-bold text-amber-800">
            Verification in Progress
          </Text>
        </View>
        <Text className="text-sm text-amber-700 leading-5">
          Our team is reviewing your documents. This usually takes up to 24 hours.
          You will be able to access the Supplier Portal once your account is approved.
        </Text>
      </View>

      <View className="bg-ink-50 rounded-2xl p-5 mb-8">
        <Text className="text-sm font-bold text-ink-800 mb-3">What happens next?</Text>
        <View className="gap-3">
          <View className="flex-row items-start gap-3">
            <View className="h-6 w-6 rounded-full bg-brand-100 items-center justify-center mt-0.5">
              <Text className="text-xs font-bold text-brand-600">1</Text>
            </View>
            <Text className="text-sm text-ink-600 flex-1">
              Our compliance team reviews your KYC documents
            </Text>
          </View>
          <View className="flex-row items-start gap-3">
            <View className="h-6 w-6 rounded-full bg-brand-100 items-center justify-center mt-0.5">
              <Text className="text-xs font-bold text-brand-600">2</Text>
            </View>
            <Text className="text-sm text-ink-600 flex-1">
              You will receive an email once your account is approved
            </Text>
          </View>
          <View className="flex-row items-start gap-3">
            <View className="h-6 w-6 rounded-full bg-brand-100 items-center justify-center mt-0.5">
              <Text className="text-xs font-bold text-brand-600">3</Text>
            </View>
            <Text className="text-sm text-ink-600 flex-1">
              Sign in to start managing your listings & bookings
            </Text>
          </View>
        </View>
      </View>

      <Button
        title="Back to Login"
        size="lg"
        block
        variant="secondary"
        onPress={handleLogout}
      />
    </Screen>
  );
}
