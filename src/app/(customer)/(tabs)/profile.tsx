import { Alert, Pressable, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { useSession } from "@/auth/sessionStore";
import { Avatar } from "@/components/ui/Avatar";
import { Screen } from "@/components/ui/Screen";
import { Button } from "@/components/ui/Button";

const MENU = [
  { icon: "notifications-outline" as const, label: "Notifications", hint: "Push alerts" },
  { icon: "card-outline" as const, label: "Payment methods", hint: "Visa •••• 4242" },
  { icon: "people-outline" as const, label: "Saved travellers", hint: "2 travellers" },
  { icon: "globe-outline" as const, label: "Language & currency", hint: "English · USD" },
  { icon: "shield-checkmark-outline" as const, label: "Help & support", hint: "FAQ, chat" },
];

export default function CustomerProfileScreen() {
  const { user, signOut } = useSession();

  function onSignOut() {
    Alert.alert("Sign out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      { text: "Sign out", style: "destructive", onPress: () => void signOut() },
    ]);
  }

  return (
    <Screen className="bg-surface-100">
      <View className="bg-brand-600 rounded-b-3xl px-5 pt-6 pb-8">
        <Text className="text-white text-xl font-extrabold">Profile</Text>
        <View className="mt-5 flex-row items-center gap-4">
          <Avatar emoji={user?.avatarEmoji} size={64} className="border-2 border-white/40" />
          <View className="flex-1">
            <Text className="text-white text-lg font-bold">{user?.name}</Text>
            <Text className="text-white/80 text-sm">{user?.email}</Text>
          </View>
        </View>
      </View>

      <View className="px-5 mt-6 gap-3">
        {MENU.map((item) => (
          <Pressable
            key={item.label}
            onPress={() =>
              Alert.alert(item.label, "This section ships in a later phase.")
            }
            className="flex-row items-center bg-white rounded-2xl border border-ink-100 px-4 py-3.5"
          >
            <Ionicons name={item.icon} size={20} color="#0a54d9" />
            <View className="flex-1 ml-3">
              <Text className="text-sm font-semibold text-ink-900">{item.label}</Text>
              <Text className="text-xs text-ink-400">{item.hint}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#b0b8c4" />
          </Pressable>
        ))}

        <View className="h-px bg-ink-100 my-2" />

        <Button title="Sign out" variant="secondary" onPress={onSignOut} block />
        <Text className="text-center text-xs text-ink-400 mt-4">
          TravelNest v1.0.0 (demo build)
        </Text>
      </View>
    </Screen>
  );
}
