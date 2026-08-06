import { Pressable, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { ListingImage } from "./ListingImage";
import { Badge } from "./ui/Badge";
import { useWishlist } from "@/store/wishlistStore";
import type { Listing } from "@/types";

/**
 * Compact horizontal listing row for search results.
 */
export function ListingRow({ listing }: { listing: Listing }) {
  const router = useRouter();
  const wishlist = useWishlist();
  const saved = wishlist.isSaved(listing.id);

  return (
    <Pressable
      onPress={() => router.push(`/listing/${listing.id}`)}
      className="flex-row bg-white rounded-2xl border border-ink-100 overflow-hidden active:opacity-80"
    >
      <ListingImage thumbnail={listing.thumbnail} url={listing.images[0]?.url} className="h-28 w-28" />
      <View className="flex-1 p-3">
        <View className="flex-row items-start justify-between gap-2">
          <Text className="flex-1 text-sm font-semibold text-ink-900 leading-5" numberOfLines={2}>
            {listing.title}
          </Text>
          <Pressable onPress={() => wishlist.toggle(listing.id)} hitSlop={8}>
            <Ionicons
              name={saved ? "heart" : "heart-outline"}
              size={18}
              color={saved ? "#ef4444" : "#848d9c"}
            />
          </Pressable>
        </View>
        <View className="mt-1 flex-row items-center gap-1">
          <Ionicons name="location-outline" size={12} color="#848d9c" />
          <Text className="text-xs text-ink-500">
            {listing.destination} · {listing.duration}
          </Text>
        </View>
        <View className="mt-1.5 flex-row items-center gap-2">
          <Text className="text-sm font-bold text-amber-500">★ {listing.rating.toFixed(1)}</Text>
          <Text className="text-xs text-ink-400">({listing.reviewCount})</Text>
        </View>
        <View className="mt-2 flex-row items-center justify-between">
          <Text className="text-base font-bold text-ink-900">{listing.price.display}</Text>
          <View className="flex-row gap-1.5">
            {listing.freeCancellation ? (
              <Badge label="Free cancel" tone="success" />
            ) : null}
            {listing.instantConfirmation ? (
              <Badge label="Instant" tone="brand" />
            ) : null}
          </View>
        </View>
      </View>
    </Pressable>
  );
}
