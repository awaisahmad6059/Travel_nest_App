import { useRouter } from "expo-router";
import { Pressable, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { Screen } from "@/components/ui/Screen";
import { Avatar } from "@/components/ui/Avatar";
import { useSession } from "@/auth/sessionStore";
import { DEMO_SUPPLIER_ID } from "@/constants/demo";
import { useSupplierDashboard } from "@/features/supplier/useSupplier";

export default function SupplierProfileScreen() {
  const router = useRouter();
  const { user, signOut } = useSession();
  const { data } = useSupplierDashboard(DEMO_SUPPLIER_ID);

  const supplier = data?.supplier;

  async function onSignOut() {
    await signOut();
    router.replace("/");
  }

  return (
    <Screen className="bg-surface-100">
      <View className="px-5 pt-4 pb-4">
        <Text className="text-2xl font-extrabold text-ink-900">Profile</Text>
      </View>

      <View className="px-5">
        <View className="bg-white rounded-2xl border border-ink-100 p-5 flex-row items-center gap-4">
          <Avatar emoji={supplier?.avatarEmoji ?? "🏔️"} size={56} />
          <View className="flex-1">
            <Text className="text-lg font-bold text-ink-900">{supplier?.name ?? user?.name}</Text>
            <Text className="text-xs text-ink-400">{user?.email}</Text>
            <View className="mt-1 flex-row items-center gap-1">
              {supplier?.verified ? (
                <View className="bg-success-50 rounded-full px-2 py-0.5">
                  <Text className="text-[11px] font-semibold text-success-600">✓ Verified partner</Text>
                </View>
              ) : null}
              <View className="bg-brand-50 rounded-full px-2 py-0.5">
                <Text className="text-[11px] font-semibold text-brand-600">
                  ★ {supplier?.rating.toFixed(1)} ({supplier?.ratingCount})
                </Text>
              </View>
            </View>
          </View>
        </View>

        <View className="mt-5 bg-white rounded-2xl border border-ink-100 overflow-hidden">
          <Row icon="calendar-outline" label="Manage availability" onPress={() => router.push("/availability")} />
          <Divider />
          <Row icon="storefront-outline" label="My listings" onPress={() => {}} />
          <Divider />
          <Row icon="chatbubble-ellipses-outline" label="Messaging" badge="Stub" onPress={() => {}} />
          <Divider />
          <Row icon="settings-outline" label="Business settings" onPress={() => {}} />
          <Divider />
          <Row icon="headset-outline" label="Support" onPress={() => {}} />
        </View>

        <Pressable
          onPress={onSignOut}
          className="mt-6 bg-danger-50 rounded-2xl py-4 items-center active:opacity-80"
        >
          <Text className="text-danger-600 text-sm font-bold">Sign out</Text>
        </Pressable>

        <Text className="text-center text-[11px] text-ink-400 mt-6">
          TravelNest Supplier v0.1.0 · Demo build
        </Text>
      </View>
    </Screen>
  );
}

function Row({
  icon,
  label,
  badge,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  badge?: string;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} className="flex-row items-center gap-3 px-4 py-4 active:bg-surface-100">
      <Ionicons name={icon} size={20} color="#0a54d9" />
      <Text className="flex-1 text-sm font-semibold text-ink-900">{label}</Text>
      {badge ? (
        <View className="bg-brand-50 rounded-full px-2 py-0.5">
          <Text className="text-[11px] font-semibold text-brand-600">{badge}</Text>
        </View>
      ) : null}
      <Ionicons name="chevron-forward" size={18} color="#c3cad4" />
    </Pressable>
  );
}

function Divider() {
  return <View className="h-px bg-ink-100 ml-14" />;
}
