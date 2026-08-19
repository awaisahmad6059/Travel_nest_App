import { Ionicons } from "@expo/vector-icons";
import { Text, View } from "react-native";

import { useSession } from "@/auth/sessionStore";
import { Button } from "@/components/ui/Button";
import { Screen } from "@/components/ui/Screen";

interface Props {
  feedback: string[];
}

export default function KycRejectedScreen({ feedback }: Props) {
  const { signOut } = useSession();

  return (
    <Screen contentContainerClassName="flex-1 justify-center px-6 py-10">
      <View className="items-center mb-8">
        <View
          className="h-24 w-24 rounded-full items-center justify-center mb-6"
          style={{ backgroundColor: "#fef2f2" }}
        >
          <Ionicons name="close-circle-outline" size={48} color="#dc2626" />
        </View>

        <Text className="text-2xl font-extrabold text-ink-900 text-center mb-2">
          Application Rejected
        </Text>

        <Text className="text-base text-ink-500 text-center leading-6">
          Unfortunately, your supplier application has been reviewed and could not be approved at this time.
        </Text>
      </View>

      {feedback.length > 0 && (
        <View className="bg-red-50 rounded-2xl border border-red-200 p-5 mb-6">
          <View className="flex-row items-center gap-2 mb-3">
            <Ionicons name="information-circle-outline" size={18} color="#dc2626" />
            <Text className="text-sm font-bold text-red-800">
              Reason
            </Text>
          </View>
          <View className="gap-2">
            {feedback.map((item, idx) => (
              <View key={idx} className="flex-row items-start gap-2">
                <Text className="text-red-500 text-sm mt-0.5">•</Text>
                <Text className="text-sm text-red-700 flex-1 leading-5">
                  {item}
                </Text>
              </View>
            ))}
          </View>
        </View>
      )}

      <View className="bg-ink-50 rounded-2xl p-5 mb-8">
        <View className="flex-row items-start gap-3">
          <Ionicons name="time-outline" size={18} color="#64748b" />
          <Text className="text-sm text-ink-600 leading-5 flex-1">
            You may re-apply with this email address after 30 days from today.
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
