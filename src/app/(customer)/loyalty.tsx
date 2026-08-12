import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, Text, View } from "react-native";

import { Screen } from "@/components/ui/Screen";
import { Button } from "@/components/ui/Button";
import { useSession } from "@/auth/sessionStore";
import { cn } from "@/utils/cn";

/**
 * Nest Rewards & Tier Perks — mirrors the web loyalty page. The backend
 * `GET /loyalty` endpoint is still planned (API_HANDOFF §5.2), so this uses
 * the same demo values the web client renders until the API ships.
 */

const POINTS_BALANCE = 1450;
const POINTS_PER_USD = 100;

const TIERS = [
  { name: "Bronze", min: 0 },
  { name: "Silver", min: 1000 },
  { name: "Gold", min: 5000 },
] as const;

const TIER_PERKS: { icon: keyof typeof Ionicons.glyphMap; title: string; desc: string }[] = [
  { icon: "flash", title: "1.5x Points Boost", desc: "Earn extra points on tours" },
  { icon: "headset", title: "Priority Support", desc: "24/7 dedicated assistance" },
  { icon: "gift", title: "Annual Reward", desc: "500 bonus points gift" },
];

const POINTS_HISTORY = [
  { title: "Booking: Luxury Bali Catamaran", date: "Aug 01, 2026", points: 450 },
  { title: "Redeemed for Lahore Tour", date: "Jul 15, 2026", points: -1000 },
  { title: "Referral Bonus (David C.)", date: "Jul 02, 2026", points: 1000 },
  { title: "Account Registration Welcome Bonus", date: "Jun 20, 2026", points: 500 },
];

function fmt(n: number): string {
  return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

export default function LoyaltyScreen() {
  const router = useRouter();
  const { user } = useSession();
  const [copied, setCopied] = useState(false);

  const refCode = user?.name
    ? `${user.name.replace(/\s+/g, "").toUpperCase()}2026`
    : "AYESHA2026";
  const refLink = `travelnest.com/ref/${refCode}`;

  const currentIndex = TIERS.reduce(
    (acc, t, i) => (POINTS_BALANCE >= t.min ? i : acc),
    0,
  );
  const current = TIERS[currentIndex];
  const next = TIERS[currentIndex + 1];
  const pointsToNext = next ? next.min - POINTS_BALANCE : 0;
  const progress = next
    ? ((POINTS_BALANCE - current.min) / (next.min - current.min)) * 100
    : 100;

  function onCopy() {
    const clipboard = (
      globalThis as unknown as {
        navigator?: { clipboard?: { writeText?: (t: string) => Promise<void> } };
      }
    ).navigator?.clipboard;
    clipboard?.writeText?.(`https://${refLink}`).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <Screen className="bg-surface-100">
      <View className="bg-brand-600 rounded-b-3xl px-5 pt-3 pb-7">
        <View className="flex-row items-center justify-center mb-3">
          <Pressable
            onPress={() => router.back()}
            hitSlop={8}
            className="absolute left-0"
          >
            <Ionicons name="chevron-back" size={24} color="#ffffff" />
          </Pressable>
          <Text className="text-base font-bold text-white">Loyalty & Rewards</Text>
        </View>

        <Text className="text-white text-xl font-extrabold">Nest Rewards & Tier Perks</Text>
        <Text className="text-white/80 text-sm mt-1 leading-5">
          Earn points on every experience booking, unlock exclusive Silver & Gold
          membership perks, and invite travel companions.
        </Text>
      </View>

      <View className="px-5 mt-6 gap-4 pb-4">
        {/* Balance card */}
        <View className="bg-white rounded-2xl border border-ink-100 p-5">
          <Text className="text-[11px] font-bold text-ink-400 uppercase tracking-wider">
            Available Rewards Balance
          </Text>
          <View className="flex-row items-end justify-between mt-2">
            <Text className="text-4xl font-extrabold text-ink-900">
              {fmt(POINTS_BALANCE)}
            </Text>
            <Text className="text-base font-bold text-brand-600 mb-1">NestPoints</Text>
          </View>
          <Text className="text-sm text-ink-500 mt-1">
            ≈ ${(POINTS_BALANCE / POINTS_PER_USD).toFixed(2)} USD Checkout Discount Value
          </Text>
          <Button title="Redeem Points at Checkout" className="mt-4" block />
        </View>

        {/* Tier status */}
        <View className="bg-white rounded-2xl border border-ink-100 p-5">
          <View className="flex-row items-center justify-between">
            <Text className="text-base font-bold text-ink-900">
              Current Status: {current.name} Tier
            </Text>
            <View className="bg-brand-50 rounded-full px-2.5 py-1">
              <Text className="text-[11px] font-bold text-brand-700 uppercase">
                {current.name}
              </Text>
            </View>
          </View>
          <Text className="text-sm text-ink-500 mt-1">
            {next
              ? `${fmt(pointsToNext)} points needed to unlock ${next.name} Status`
              : "You've reached the top tier"}
          </Text>

          <View className="mt-4 h-2.5 rounded-full bg-ink-100 overflow-hidden">
            <View
              className="h-full rounded-full bg-accent-500"
              style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
            />
          </View>

          <View className="flex-row justify-between mt-3">
            {TIERS.map((t) => {
              const unlocked = POINTS_BALANCE >= t.min;
              return (
                <View key={t.name} className="items-center gap-1">
                  <Ionicons
                    name={unlocked ? "checkmark-circle" : "ellipse-outline"}
                    size={20}
                    color={unlocked ? "#059669" : "#b0b8c4"}
                  />
                  <Text
                    className={cn(
                      "text-xs font-semibold",
                      unlocked ? "text-ink-900" : "text-ink-400",
                    )}
                  >
                    {t.name}
                  </Text>
                  <Text className="text-[10px] text-ink-400">{fmt(t.min)} pts</Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Tier perks */}
        <View className="bg-white rounded-2xl border border-ink-100 p-5 gap-4">
          <Text className="text-base font-bold text-ink-900">
            {current.name} Tier Perks
          </Text>
          {TIER_PERKS.map((p) => (
            <View key={p.title} className="flex-row items-center gap-3">
              <View className="h-10 w-10 rounded-xl bg-accent-50 items-center justify-center">
                <Ionicons name={p.icon} size={20} color="#e85f00" />
              </View>
              <View className="flex-1">
                <Text className="text-sm font-semibold text-ink-900">{p.title}</Text>
                <Text className="text-xs text-ink-500">{p.desc}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Invite friends */}
        <View className="bg-white rounded-2xl border border-ink-100 p-5">
          <Text className="text-base font-bold text-ink-900">Invite Friends & Earn</Text>
          <Text className="text-sm text-ink-500 mt-1">
            Earn 1,000 NestPoints ($10) for every friend who books. They get $10 off
            their first experience.
          </Text>

          <View className="mt-4 flex-row items-center gap-2 bg-surface-100 border border-ink-100 rounded-xl px-3 py-2.5">
            <Text className="flex-1 text-xs font-medium text-ink-600" numberOfLines={1}>
              {refLink}
            </Text>
            <Pressable
              onPress={onCopy}
              hitSlop={8}
              className="flex-row items-center gap-1"
            >
              <Ionicons
                name={copied ? "checkmark" : "copy-outline"}
                size={16}
                color={copied ? "#059669" : "#0a54d9"}
              />
              <Text
                className={cn(
                  "text-xs font-bold",
                  copied ? "text-success-600" : "text-brand-600",
                )}
              >
                {copied ? "Copied!" : "Copy Link"}
              </Text>
            </Pressable>
          </View>

          <View className="flex-row gap-3 mt-4">
            <View className="flex-1 bg-surface-100 rounded-2xl p-4 items-center">
              <Text className="text-xl font-extrabold text-ink-900">3</Text>
              <Text className="text-xs text-ink-500 mt-0.5">Friends Invited</Text>
            </View>
            <View className="flex-1 bg-surface-100 rounded-2xl p-4 items-center">
              <Text className="text-xl font-extrabold text-ink-900">3,000</Text>
              <Text className="text-xs text-ink-500 mt-0.5">Points Earned</Text>
            </View>
          </View>
        </View>

        {/* Points history */}
        <View className="bg-white rounded-2xl border border-ink-100 p-5">
          <Text className="text-base font-bold text-ink-900 mb-2">
            Recent Points History
          </Text>
          {POINTS_HISTORY.map((h, i) => (
            <View
              key={`${h.title}-${h.date}`}
              className={cn(
                "flex-row items-center py-2.5",
                i > 0 && "border-t border-ink-50",
              )}
            >
              <View className="flex-1 pr-3">
                <Text className="text-sm font-medium text-ink-900" numberOfLines={1}>
                  {h.title}
                </Text>
                <Text className="text-xs text-ink-400 mt-0.5">{h.date}</Text>
              </View>
              <Text
                className={cn(
                  "text-sm font-bold",
                  h.points > 0 ? "text-success-600" : "text-danger-600",
                )}
              >
                {h.points > 0 ? "+" : ""}
                {fmt(h.points)} pts
              </Text>
            </View>
          ))}
        </View>
      </View>
    </Screen>
  );
}
