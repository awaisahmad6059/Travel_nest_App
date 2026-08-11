import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Tabs } from "expo-router";
import { useEffect } from "react";
import {
  Pressable,
  View,
  useWindowDimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";

type IconName = keyof typeof Ionicons.glyphMap;

const TABS: {
  name: string;
  label: string;
  icon: IconName;
  iconActive: IconName;
}[] = [
  { name: "index", label: "Home", icon: "home-outline", iconActive: "home" },
  {
    name: "bookings",
    label: "Bookings",
    icon: "ticket-outline",
    iconActive: "ticket",
  },
  {
    name: "wishlist",
    label: "Wishlist",
    icon: "heart-outline",
    iconActive: "heart",
  },
  {
    name: "profile",
    label: "Profile",
    icon: "person-circle-outline",
    iconActive: "person-circle",
  },
];

const MARGIN_X = 16;
const PAD = 8;
const BUBBLE_W = 42;
const BUBBLE_H = 30;
const BUBBLE_BG = "#eaf2fe";
const ACTIVE = "#0a54d9";
const INACTIVE = "#111827";

type TabBarProps = {
  state: { index: number; routes: { name: string; key: string }[] };
  navigation: {
    emit: (event: {
      type: "tabPress";
      target?: string;
      canPreventDefault: true;
    }) => { defaultPrevented?: boolean };
    navigate: (name: string) => void;
  };
};

function tapHaptic() {
  try {
    void Haptics.selectionAsync();
  } catch {
    // Haptics are best-effort (unavailable on web / unsupported devices).
  }
}

function TabItem({
  tab,
  active,
  onPress,
}: {
  tab: (typeof TABS)[number];
  active: boolean;
  onPress: () => void;
}) {
  const scale = useSharedValue(1);
  const labelOpacity = useSharedValue(active ? 1 : 0.55);
  const labelTranslateY = useSharedValue(active ? 0 : 2);
  const morph = useSharedValue(active ? 1 : 0);

  useEffect(() => {
    labelOpacity.value = withTiming(active ? 1 : 0.55, { duration: 180 });
    labelTranslateY.value = withTiming(active ? 0 : 2, { duration: 180 });
    morph.value = withTiming(active ? 1 : 0, { duration: 220 });
  }, [active, labelOpacity, labelTranslateY, morph]);

  const iconStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const outlineStyle = useAnimatedStyle(() => ({
    opacity: 1 - morph.value,
  }));

  const filledStyle = useAnimatedStyle(() => ({
    opacity: morph.value,
    transform: [{ scale: 0.6 + 0.4 * morph.value }],
  }));

  const labelStyle = useAnimatedStyle(() => ({
    opacity: labelOpacity.value,
    transform: [{ translateY: labelTranslateY.value }],
  }));

  return (
    <Pressable
      onPress={onPress}
      onPressIn={() => {
        // Reanimated shared values are intentionally mutable (not React state).
        // eslint-disable-next-line react-hooks/immutability
        scale.value = withSpring(0.82, { damping: 14, stiffness: 320 });
      }}
      onPressOut={() => {
        // eslint-disable-next-line react-hooks/immutability
        scale.value = withSpring(1, { damping: 12, stiffness: 260 });
      }}
      style={{
        flex: 1,
        alignItems: "center",
        paddingTop: PAD,
        paddingBottom: PAD + 2,
      }}
      accessibilityRole="tab"
      accessibilityState={{ selected: active }}
      accessibilityLabel={tab.label}
    >
      <Animated.View
        style={[
          {
            height: BUBBLE_H,
            width: 26,
            alignItems: "center",
            justifyContent: "center",
          },
          iconStyle,
        ]}
      >
        <Animated.View
          style={[
            { position: "absolute", top: 0, left: 0, right: 0, bottom: 0 },
            { alignItems: "center", justifyContent: "center" },
            outlineStyle,
          ]}
        >
          <Ionicons name={tab.icon} size={21} color={INACTIVE} />
        </Animated.View>
        <Animated.View
          style={[
            { position: "absolute", top: 0, left: 0, right: 0, bottom: 0 },
            { alignItems: "center", justifyContent: "center" },
            filledStyle,
          ]}
        >
          <Ionicons name={tab.iconActive} size={21} color={ACTIVE} />
        </Animated.View>
      </Animated.View>
      <Animated.Text
        style={[
          { marginTop: 3, fontSize: 10, letterSpacing: 0.2 },
          active
            ? { fontWeight: "700", color: ACTIVE }
            : { fontWeight: "600", color: INACTIVE },
          labelStyle,
        ]}
      >
        {tab.label}
      </Animated.Text>
    </Pressable>
  );
}

function CustomTabBar({ state, navigation }: TabBarProps) {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  const itemWidth = (width - MARGIN_X * 2 - PAD * 2) / TABS.length;

  const activeName = state.routes[state.index]?.name ?? "index";
  const activeIndex = Math.max(0, TABS.findIndex((t) => t.name === activeName));

  const bubbleX = useSharedValue(
    PAD + activeIndex * itemWidth + (itemWidth - BUBBLE_W) / 2,
  );
  const bubbleScale = useSharedValue(1);

  useEffect(() => {
    bubbleX.value = withSpring(
      PAD + activeIndex * itemWidth + (itemWidth - BUBBLE_W) / 2,
      { damping: 24, stiffness: 250, mass: 0.8 },
    );
    bubbleScale.value = withSequence(
      withTiming(1.12, { duration: 110 }),
      withSpring(1, { damping: 13, stiffness: 300 }),
    );
  }, [activeIndex, itemWidth, bubbleX, bubbleScale]);

  const bubbleStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: bubbleX.value },
      { scale: bubbleScale.value },
    ],
  }));

  function handlePress(name: string) {
    const route = state.routes.find((r) => r.name === name);
    if (!route) return;
    const event = navigation.emit({
      type: "tabPress",
      target: route.key,
      canPreventDefault: true,
    });
    if (!event?.defaultPrevented) {
      navigation.navigate(name);
      tapHaptic();
    }
  }

  return (
    <View className="absolute bottom-0 left-0 right-0">
      <View
        style={{
          flexDirection: "row",
          alignItems: "flex-start",
          marginHorizontal: MARGIN_X,
          marginBottom: Math.max(insets.bottom, 12),
          paddingHorizontal: PAD,
          borderRadius: 24,
          backgroundColor: "#ffffff",
          borderWidth: 1,
          borderColor: "rgba(15,23,42,0.06)",
          shadowColor: "#0f172a",
          shadowOpacity: 0.12,
          shadowRadius: 24,
          shadowOffset: { width: 0, height: -6 },
          elevation: 18,
        }}
      >
        <Animated.View
          style={[
            {
              position: "absolute",
              top: PAD,
              left: 0,
              width: BUBBLE_W,
              height: BUBBLE_H,
              borderRadius: BUBBLE_H / 2,
              backgroundColor: BUBBLE_BG,
              shadowColor: "#0f172a",
              shadowOpacity: 0.06,
              shadowRadius: 6,
              shadowOffset: { width: 0, height: 2 },
              elevation: 2,
            },
            bubbleStyle,
          ]}
        />
        {TABS.map((tab) => (
          <TabItem
            key={tab.name}
            tab={tab}
            active={tab.name === activeName}
            onPress={() => handlePress(tab.name)}
          />
        ))}
      </View>
    </View>
  );
}

export default function CustomerTabsLayout() {
  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        animation: "shift",
      }}
    >
      <Tabs.Screen name="index" options={{ title: "Home" }} />
      <Tabs.Screen name="search" options={{ href: null }} />
      <Tabs.Screen name="bookings" options={{ title: "Bookings" }} />
      <Tabs.Screen name="wishlist" options={{ title: "Wishlist" }} />
      <Tabs.Screen name="profile" options={{ title: "Profile" }} />
    </Tabs>
  );
}
