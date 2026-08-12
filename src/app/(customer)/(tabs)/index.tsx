import { useEffect, useRef, useState } from "react";
import { useRouter } from "expo-router";
import { FlatList, Pressable, ScrollView, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { Screen } from "@/components/ui/Screen";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { SearchBar } from "@/components/ui/SearchBar";
import { SkeletonCard } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { ColdStartBanner } from "@/components/ui/ColdStartBanner";
import { ListingCard } from "@/components/ListingCard";
import { Sheet } from "@/components/ui/Sheet";
import { Button } from "@/components/ui/Button";
import { CATEGORIES } from "@/constants/categories";
import { useHomeFeed } from "@/features/home/useHomeFeed";
import { useSession } from "@/auth/sessionStore";
import { isTimeoutError } from "@/api/client";
import { cn } from "@/utils/cn";
import { APP_NAME } from "@/config";
import type { Listing } from "@/types";

/** Loads slower than this are treated as a backend cold start. */
const COLD_START_THRESHOLD_MS = 1500;

/** Emoji per known city; fallback 🌍 for any other backend destination. */
const DESTINATION_EMOJI: Record<string, string> = {
  Lahore: "🕌",
  Karachi: "🌊",
  Bali: "🏝️",
  Tokyo: "⛩️",
  Paris: "🗼",
  Dubai: "🏙️",
  Rome: "🏛️",
  Skardu: "🏔️",
};

/** Shown only when the destinations fetch hasn't loaded yet or fails. */
const FALLBACK_DESTINATIONS: DestinationCard[] = [
  { name: "Lahore", country: "Pakistan", emoji: "🕌" },
  { name: "Karachi", country: "Pakistan", emoji: "🌊" },
  { name: "Bali", country: "Indonesia", emoji: "🏝️" },
  { name: "Tokyo", country: "Japan", emoji: "⛩️" },
  { name: "Paris", country: "France", emoji: "🗼" },
  { name: "Dubai", country: "UAE", emoji: "🏙️" },
  { name: "Rome", country: "Italy", emoji: "🏛️" },
  { name: "Skardu", country: "Pakistan", emoji: "🏔️" },
];

type DestinationCard = {
  name: string;
  country: string;
  emoji: string;
};

const FLASH_SALE_TEXT =
  "Flash Sale: Get 15% off Bali & Tokyo Experiences with code";
const FLASH_SALE_CODE = "TRAVELNEST2026";

type SheetKind = "destinations" | "explore" | null;

export default function CustomerHomeScreen() {
  const router = useRouter();
  const { user } = useSession();
  const { data, isLoading, isError, error, isFetching, refetch } = useHomeFeed();
  const [coldStart, setColdStart] = useState(false);
  const [sheet, setSheet] = useState<SheetKind>(null);
  const [topExperiencesY, setTopExperiencesY] = useState(0);
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    if (!isFetching) return;
    const timer = setTimeout(() => setColdStart(true), COLD_START_THRESHOLD_MS);
    return () => clearTimeout(timer);
  }, [isFetching]);

  const timedOut = isError && isTimeoutError(error);

  function openTopExperiences() {
    setSheet(null);
    setTimeout(() => {
      scrollRef.current?.scrollTo({ y: topExperiencesY, animated: true });
    }, 300);
  }

  function openLoyalty() {
    setSheet(null);
    router.push("/loyalty");
  }

  function openDestinations() {
    setSheet(null);
    router.push("/search");
  }

  function openDestination(d: DestinationCard) {
    setSheet(null);
    router.push({ pathname: "/search", params: { destination: d.name } });
  }

  const cities: DestinationCard[] =
    data?.destinations?.length
      ? data.destinations.map((d) => {
          // Backend names are "Lahore, Pakistan" — country is shown separately,
          // so keep just the city for the card and the search param.
          const city = d.name.split(",")[0].trim();
          return {
            name: city || d.name,
            country: d.country,
            emoji: DESTINATION_EMOJI[city] ?? DESTINATION_EMOJI[d.name] ?? "🌍",
          };
        })
      : FALLBACK_DESTINATIONS;

  return (
    <Screen scroll={false} className="bg-surface-100">
      <ScrollView
        ref={scrollRef}
        contentContainerClassName="pb-10"
        showsVerticalScrollIndicator={false}
      >
        {/* Flash sale strip */}
        <View className="bg-accent-500 px-5 py-2.5 flex-row items-center gap-2">
          <View className="bg-white/20 rounded-md px-1.5 py-0.5">
            <Text className="text-sm">⚡</Text>
          </View>
          <Text className="flex-1 text-white text-xs font-semibold">
            {FLASH_SALE_TEXT}
          </Text>
          <View className="bg-white/25 rounded-md px-2 py-1 border border-white/30">
            <Text className="text-white text-[10px] font-bold tracking-wider">
              {FLASH_SALE_CODE}
            </Text>
          </View>
        </View>

        {/* Header */}
        <View className="bg-brand-600 rounded-b-3xl px-5 pt-4 pb-5">
          <View className="flex-row items-center justify-between mb-4">
            <View className="flex-row items-center gap-2">
              <View className="h-9 w-9 rounded-xl bg-white/20 items-center justify-center">
                <Text className="text-lg">✈️</Text>
              </View>
              <Text className="text-lg font-extrabold text-white">{APP_NAME}</Text>
            </View>
            <Pressable onPress={() => router.push("/profile")} hitSlop={8}>
              <Text className="text-2xl">{user?.avatarEmoji ?? "🧳"}</Text>
            </Pressable>
          </View>

          <Text className="text-white text-xl font-bold mb-1">
            {user ? `Hi ${user.name.split(" ")[0]}! 👋` : "Hi there! 👋"}
          </Text>
          <Text className="text-white/80 text-sm mb-4">
            Where are you off to next?
          </Text>

          <SearchBar interactive onFocus={() => router.push("/search")} />

          {/* Explore dropdown triggers */}
          <View className="flex-row gap-2 mt-4">
            <Pressable
              onPress={() => setSheet("destinations")}
              className="flex-1 bg-white/15 border border-white/25 rounded-full py-2.5 flex-row items-center justify-center gap-1.5 active:bg-white/25"
            >
              <Text className="text-sm">🌍</Text>
              <Text className="text-sm font-semibold text-white">Destinations</Text>
              <Ionicons name="chevron-down" size={14} color="#ffffff" />
            </Pressable>
            <Pressable
              onPress={() => setSheet("explore")}
              className="flex-1 bg-white/15 border border-white/25 rounded-full py-2.5 flex-row items-center justify-center gap-1.5 active:bg-white/25"
            >
              <Text className="text-sm">✨</Text>
              <Text className="text-sm font-semibold text-white">Explore</Text>
              <Ionicons name="chevron-down" size={14} color="#ffffff" />
            </Pressable>
          </View>
        </View>

        {coldStart ? (
          <ColdStartBanner
            onDismiss={() => setColdStart(false)}
            onRetry={timedOut ? () => refetch() : undefined}
          />
        ) : null}

        {/* Categories */}
        <FlatList
          horizontal
          data={CATEGORIES}
          keyExtractor={(c) => c.id}
          showsHorizontalScrollIndicator={false}
          contentContainerClassName="px-5 py-4 gap-2.5"
          renderItem={({ item }) => (
            <Pressable
              onPress={() =>
                router.push({ pathname: "/search", params: { category: item.id } })
              }
              className="bg-white border border-ink-200 rounded-2xl px-4 py-2.5 flex-row items-center gap-2"
            >
              <Text className="text-lg">{item.emoji}</Text>
              <Text className="text-sm font-semibold text-ink-800">{item.label}</Text>
            </Pressable>
          )}
        />

        {isLoading ? (
          <View className="px-5 gap-4">
            <SkeletonCard />
            <SkeletonCard />
          </View>
        ) : isError || !data ? (
          <EmptyState
            emoji="😵"
            title="Couldn't load the feed"
            message="Check your connection and try again."
          />
        ) : (
          <>
            <View
              onLayout={(e) => setTopExperiencesY(e.nativeEvent.layout.y)}
            >
              <SectionHeader
                title="Top Experiences"
                subtitle="Handpicked top-rated experiences"
                right={
                  <Pressable
                    onPress={() =>
                      router.push({ pathname: "/search", params: { sort: "rating" } })
                    }
                  >
                    <Text className="text-sm font-semibold text-brand-600">See all</Text>
                  </Pressable>
                }
              />
              <Rail listings={data.topRated} onPress={(id) => router.push(`/listing/${id}`)} />
            </View>

            <SectionHeader
              title="Popular This Week"
              subtitle="Most booked verified experiences globally"
              right={
                <Pressable onPress={() => router.push("/search")}>
                  <Text className="text-sm font-semibold text-brand-600">See all</Text>
                </Pressable>
              }
            />
            <Rail listings={data.popular} onPress={(id) => router.push(`/listing/${id}`)} />

            <SectionHeader
              title="Trending now"
              subtitle="What travellers are booking this week"
              right={
                <Pressable
                  onPress={() =>
                    router.push({ pathname: "/search", params: { sort: "rating" } })
                  }
                >
                  <Text className="text-sm font-semibold text-brand-600">See all</Text>
                </Pressable>
              }
            />
            <Rail listings={data.trending} onPress={(id) => router.push(`/listing/${id}`)} />

            <SectionHeader
              title="Deals for you"
              subtitle="Handpicked at a price you'll love"
              right={
                <Pressable
                  onPress={() => router.push({ pathname: "/search", params: { sort: "price-asc" } })}
                >
                  <Text className="text-sm font-semibold text-brand-600">See all</Text>
                </Pressable>
              }
            />
            <Rail listings={data.deals} onPress={(id) => router.push(`/listing/${id}`)} />

            <SectionHeader
              title="For you"
              subtitle="AI picks based on your taste"
              right={
                <Pressable onPress={() => refetch()}>
                  <Text className="text-sm font-semibold text-brand-600">Refresh</Text>
                </Pressable>
              }
            />
            <Rail listings={data.forYou} onPress={(id) => router.push(`/listing/${id}`)} />
          </>
        )}
      </ScrollView>

      {/* Destinations sheet */}
      <Sheet
        visible={sheet === "destinations"}
        title="Destinations"
        onClose={() => setSheet(null)}
        footer={
          <Button title="View All Destinations" size="lg" block onPress={openDestinations} />
        }
      >
        <Text className="text-sm text-ink-500 mb-3">
          Featured Global Cities — verified local operator hubs
        </Text>
        <DestinationsGrid cities={cities} onSelect={openDestination} />
      </Sheet>

      {/* Explore TravelNest sheet */}
      <Sheet
        visible={sheet === "explore"}
        title="Explore TravelNest"
        onClose={() => setSheet(null)}
      >
        <Pressable
          onPress={openTopExperiences}
          className="flex-row items-center gap-3 py-3.5 border-b border-ink-100 active:bg-ink-50"
        >
          <View className="h-10 w-10 rounded-xl bg-brand-50 items-center justify-center">
            <Text className="text-lg">⭐</Text>
          </View>
          <View className="flex-1">
            <Text className="text-sm font-semibold text-ink-900">Top Experiences</Text>
            <Text className="text-xs text-ink-500">Jump to our handpicked top-rated rail</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#b0b8c4" />
        </Pressable>
        <Pressable
          onPress={openLoyalty}
          className="flex-row items-center gap-3 py-3.5 active:bg-ink-50"
        >
          <View className="h-10 w-10 rounded-xl bg-accent-50 items-center justify-center">
            <Text className="text-lg">🏅</Text>
          </View>
          <View className="flex-1">
            <Text className="text-sm font-semibold text-ink-900">Loyalty & Rewards</Text>
            <Text className="text-xs text-ink-500">Earn points on every booking</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#b0b8c4" />
        </Pressable>
      </Sheet>
    </Screen>
  );
}

function DestinationsGrid({
  cities,
  onSelect,
}: {
  cities: DestinationCard[];
  onSelect: (d: DestinationCard) => void;
}) {
  return (
    <View className="flex-row flex-wrap justify-between">
      {cities.map((d) => (
        <Pressable
          key={d.name}
          onPress={() => onSelect(d)}
          className="bg-surface-50 rounded-2xl border border-ink-100 p-3 flex-row items-center gap-2.5 mb-3 w-[48%] active:opacity-80"
        >
          <View className="h-10 w-10 rounded-xl bg-surface-100 items-center justify-center">
            <Text className="text-xl">{d.emoji}</Text>
          </View>
          <View className="flex-1">
            <Text className="text-sm font-bold text-ink-900" numberOfLines={1}>
              {d.name}
            </Text>
            <Text className="text-xs text-ink-400" numberOfLines={1}>
              {d.country}
            </Text>
          </View>
        </Pressable>
      ))}
    </View>
  );
}

function Rail({
  listings,
  onPress,
}: {
  listings: Listing[];
  onPress: (id: string) => void;
}) {
  return (
    <FlatList
      horizontal
      data={listings}
      keyExtractor={(l) => l.id}
      showsHorizontalScrollIndicator={false}
      contentContainerClassName={cn("px-5 pb-5 gap-3")}
      renderItem={({ item }) => (
        <Pressable onPress={() => onPress(item.id)}>
          <ListingCard listing={item} />
        </Pressable>
      )}
    />
  );
}
