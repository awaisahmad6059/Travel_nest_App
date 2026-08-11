import { Ionicons } from "@expo/vector-icons";
import { Pressable, ScrollView, Text, View } from "react-native";

import { SubScreenHeader } from "@/components/profile/SubScreenHeader";
import { SafeAreaView } from "@/components/ui/SafeAreaView";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import { useNotifications, type NotificationKind } from "@/store/notificationStore";

function relativeTime(ts: number): string {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return new Date(ts).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
  });
}

const KIND_META: Record<
  NotificationKind,
  { icon: keyof typeof Ionicons.glyphMap; color: string }
> = {
  cart: { icon: "cart-outline", color: "#0a54d9" },
  booking: { icon: "checkmark-circle", color: "#16a34a" },
  hold: { icon: "timer-outline", color: "#d97706" },
  info: { icon: "notifications-outline", color: "#4d5565" },
};

export default function NotificationsScreen() {
  const { items, unreadCount, markRead, markAllRead, removeAll, add } = useNotifications();

  return (
    <SafeAreaView className="flex-1 bg-surface-100">
      <SubScreenHeader title="Notifications" />

      {items.length > 0 ? (
        <View className="flex-row justify-end px-5 pb-2 gap-3">
          {unreadCount > 0 ? (
            <Pressable onPress={markAllRead} hitSlop={6}>
              <Text className="text-sm font-semibold text-brand-600">Mark all read</Text>
            </Pressable>
          ) : null}
          <Pressable
            onPress={() =>
              removeAll()
            }
            hitSlop={6}
          >
            <Text className="text-sm font-semibold text-danger-500">Clear all</Text>
          </Pressable>
        </View>
      ) : null}

      {items.length === 0 ? (
        <EmptyState
          emoji="🔔"
          title="No notifications yet"
          message="Add something to your cart, place a booking, or reserve a slot and alerts will show up here."
        />
      ) : (
        <ScrollView className="flex-1 px-5 pb-8" showsVerticalScrollIndicator={false}>
          <View className="gap-3">
            {items.map((n) => {
              const meta = KIND_META[n.kind];
              return (
                <Pressable
                  key={n.id}
                  onPress={() => markRead(n.id)}
                  className={`bg-white rounded-2xl border px-4 py-3.5 flex-row items-start gap-3 ${
                    n.read ? "border-ink-100" : "border-brand-200"
                  }`}
                >
                  <View
                    className={`mt-0.5 h-9 w-9 rounded-full items-center justify-center ${
                      n.read ? "bg-ink-100" : "bg-brand-50"
                    }`}
                  >
                    <Ionicons name={meta.icon} size={18} color={meta.color} />
                  </View>
                  <View className="flex-1">
                    <View className="flex-row items-center justify-between">
                      <Text className="flex-1 text-sm font-bold text-ink-900">
                        {n.title}
                      </Text>
                      {!n.read ? (
                        <View className="ml-2 h-2 w-2 rounded-full bg-brand-500" />
                      ) : null}
                    </View>
                    <Text className="mt-0.5 text-sm text-ink-500 leading-5">{n.body}</Text>
                    <Text className="mt-1 text-xs text-ink-400">{relativeTime(n.createdAt)}</Text>
                  </View>
                </Pressable>
              );
            })}
          </View>
          <Button
            title="Demo — trigger a sample notification"
            variant="secondary"
            className="mt-6"
            onPress={() =>
              add({
                kind: "info",
                title: "Sample notification",
                body: "This is a local demo alert. Real events (cart, booking, hold) will appear here automatically.",
              })
            }
          />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
