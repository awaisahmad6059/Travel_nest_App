import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { ColorValue, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { cn } from "@/utils/cn";

function TabIcon({
  name,
  color,
  focused,
}: {
  name: keyof typeof Ionicons.glyphMap;
  color: ColorValue;
  focused: boolean;
}) {
  return (
    <View
      className={cn(
        "h-8 min-w-14 px-3 rounded-full items-center justify-center",
        focused && "bg-brand-50",
      )}
    >
      <Ionicons name={name} size={22} color={color} />
    </View>
  );
}

export default function CustomerTabsLayout() {
  const insets = useSafeAreaInsets();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#0a54d9",
        tabBarInactiveTintColor: "#848d9c",
        tabBarLabelStyle: { fontSize: 11, fontWeight: "600" },
        tabBarStyle: {
          backgroundColor: "#ffffff",
          borderTopColor: "#eceef2",
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          paddingTop: 6,
          height: 58 + Math.max(insets.bottom, 12),
          paddingBottom: Math.max(insets.bottom, 12),
          shadowColor: "#0a54d9",
          shadowOpacity: 0.06,
          shadowRadius: 12,
          shadowOffset: { width: 0, height: -4 },
          elevation: 8,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="home" color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen name="search" options={{ href: null }} />
      <Tabs.Screen
        name="bookings"
        options={{
          title: "Bookings",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="ticket-outline" color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="wishlist"
        options={{
          title: "Wishlist",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="heart-outline" color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon
              name="person-circle-outline"
              color={color}
              focused={focused}
            />
          ),
        }}
      />
    </Tabs>
  );
}
