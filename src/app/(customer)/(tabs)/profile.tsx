import { Ionicons } from "@expo/vector-icons";
import { useRouter, type Href } from "expo-router";
import { Alert, Image, Pressable, Text, View } from "react-native";

import { useSession } from "@/auth/sessionStore";
import { Avatar } from "@/components/ui/Avatar";
import { Screen } from "@/components/ui/Screen";
import { Button } from "@/components/ui/Button";
import { useNotifications } from "@/store/notificationStore";
import { usePaymentMethodsStore } from "@/store/paymentMethodsStore";
import { useProfileStore } from "@/store/profileStore";
import { LANGUAGES, useSettingsStore } from "@/store/settingsStore";
import { useTravelersStore } from "@/store/travelersStore";

export default function CustomerProfileScreen() {
  const router = useRouter();
  const { user, signOut } = useSession();
  const { unreadCount } = useNotifications();
  const cards = usePaymentMethodsStore((s) => s.cards);
  const travelers = useTravelersStore((s) => s.travelers);
  const settings = useSettingsStore();
  const { displayName, avatarUri } = useProfileStore();

  const name = displayName?.trim() || user?.name || "Traveler";
  const languageLabel =
    LANGUAGES.find((l) => l.code === settings.language)?.label ?? "English";
  const currencyLabel = settings.currency;

  const MENU: {
    icon: keyof typeof Ionicons.glyphMap;
    label: string;
    hint: string;
    href: Href;
  }[] = [
    {
      icon: "person-outline",
      label: "Edit profile",
      hint: "Name & photo",
      href: "/profile/edit",
    },
    {
      icon: "notifications-outline",
      label: "Notifications",
      hint: unreadCount > 0 ? `${unreadCount} new alert${unreadCount > 1 ? "s" : ""}` : "No new alerts",
      href: "/profile/notifications",
    },
    {
      icon: "card-outline",
      label: "Payment methods",
      hint: cards.length > 0 ? cards[0].label : "No saved cards",
      href: "/profile/payment-methods",
    },
    {
      icon: "people-outline",
      label: "Saved travellers",
      hint: `${travelers.length} ${travelers.length === 1 ? "traveller" : "travellers"}`,
      href: "/profile/travellers",
    },
    {
      icon: "globe-outline",
      label: "Language & currency",
      hint: `${languageLabel} · ${currencyLabel}`,
      href: "/profile/language-currency",
    },
    {
      icon: "shield-checkmark-outline",
      label: "Help & support",
      hint: "FAQ, chat",
      href: "/profile/help-support",
    },
  ];

  function onSignOut() {
    Alert.alert("Sign out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      { text: "Sign out", style: "destructive", onPress: () => void signOut() },
    ]);
  }

  return (
    <Screen className="bg-surface-100">
      <View className="bg-brand-600 rounded-b-3xl px-5 pt-6 pb-8">
        <View className="flex-row items-center justify-between">
          <Text className="text-white text-xl font-extrabold">Profile</Text>
          <Pressable
            onPress={() => router.push("/profile/notifications")}
            hitSlop={8}
            className="relative p-1"
          >
            <Ionicons name="notifications-outline" size={24} color="#ffffff" />
            {unreadCount > 0 ? (
              <View className="absolute -top-0.5 -right-0.5 min-w-4 h-4 rounded-full bg-danger-500 items-center justify-center px-1">
                <Text className="text-[10px] font-bold text-white">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </Text>
              </View>
            ) : null}
          </Pressable>
        </View>

        <Pressable
          className="mt-5 flex-row items-center gap-4"
          onPress={() => router.push("/profile/edit")}
        >
          <View className="relative">
            {avatarUri ? (
              <Image
                source={{ uri: avatarUri }}
                style={{ width: 64, height: 64, borderRadius: 32 }}
              />
            ) : (
              <Avatar emoji={user?.avatarEmoji} size={64} className="border-2 border-white/40" />
            )}
            <View className="absolute bottom-0 right-0 bg-white rounded-full p-1.5 border border-ink-100">
              <Ionicons name="pencil" size={12} color="#0a54d9" />
            </View>
          </View>
          <View className="flex-1">
            <Text className="text-white text-lg font-bold">{name}</Text>
            <Text className="text-white/80 text-sm">{user?.email}</Text>
          </View>
        </Pressable>
      </View>

      <View className="px-5 mt-6 gap-3">
        {MENU.map((item) => (
          <Pressable
            key={item.label}
            onPress={() => router.push(item.href)}
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
