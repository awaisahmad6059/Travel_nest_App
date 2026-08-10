import { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import { FlatList, Pressable, Text, View } from "react-native";

import { Screen } from "@/components/ui/Screen";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { SearchBar } from "@/components/ui/SearchBar";
import { SkeletonCard } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { ColdStartBanner } from "@/components/ui/ColdStartBanner";
import { ListingCard } from "@/components/ListingCard";
import { CATEGORIES } from "@/constants/categories";
import { useHomeFeed } from "@/features/home/useHomeFeed";
import { useSession } from "@/auth/sessionStore";
import { isTimeoutError } from "@/api/client";
import { cn } from "@/utils/cn";
import { APP_NAME } from "@/config";
import type { Listing } from "@/types";

/** Loads slower than this are treated as a backend cold start. */
const COLD_START_THRESHOLD_MS = 1500;

export default function CustomerHomeScreen() {
  const router = useRouter();
  const { user } = useSession();
  const { data, isLoading, isError, error, isFetching, refetch } = useHomeFeed();
  const [coldStart, setColdStart] = useState(false);

  useEffect(() => {
    if (!isFetching) return;
    const timer = setTimeout(() => setColdStart(true), COLD_START_THRESHOLD_MS);
    return () => clearTimeout(timer);
  }, [isFetching]);

  const timedOut = isError && isTimeoutError(error);

  return (
    <Screen
      className="bg-surface-100"
      contentContainerClassName="pb-10"
    >
      {/* Header */}
      <View className="bg-brand-600 rounded-b-3xl px-5 pt-4 pb-6">
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
    </Screen>
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
