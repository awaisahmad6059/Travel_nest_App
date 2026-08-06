import { Pressable, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { ListingImage } from "./ListingImage";
import { RatingStars } from "./ui/RatingStars";
import { useWishlist } from "@/store/wishlistStore";
import type { Listing } from "@/types";

/**
 * Vertical listing card for the Home feed rails and search results grid.
 */
export function ListingCard({
  listing,
  width = 260,
}: {
  listing: Listing;
  width?: number;
}) {
  const router = useRouter();
  const wishlist = useWishlist();
  const saved = wishlist.isSaved(listing.id);

  return (
    <Pressable
      onPress={() => router.push(`/listing/${listing.id}`)}
      className="bg-white rounded-2xl overflow-hidden border border-ink-100 active:opacity-80"
      style={{ width }}
    >
      <ListingImage thumbnail={listing.thumbnail} url={listing.images[0]?.url} className="h-36 w-full" />
      <View className="p-3">
        <View className="flex-row items-center justify-between">
          <RatingStars rating={listing.rating} />
          <Pressable
            onPress={() => wishlist.toggle(listing.id)}
            hitSlop={8}
          >
            <Ionicons
              name={saved ? "heart" : "heart-outline"}
              size={18}
              color={saved ? "#ef4444" : "#848d9c"}
            />
          </Pressable>
        </View>
        <Text className="mt-2 text-sm font-semibold text-ink-900" numberOfLines={2}>
          {listing.title}
        </Text>
        <View className="mt-1 flex-row items-center gap-1">
          <Ionicons name="location-outline" size={12} color="#848d9c" />
          <Text className="text-xs text-ink-500">
            {listing.destination} · {listing.duration}
          </Text>
        </View>
        <View className="mt-2.5 flex-row items-baseline">
          <Text className="text-base font-bold text-ink-900">{listing.price.display}</Text>
          <Text className="ml-1 text-xs text-ink-400">/ pax</Text>
        </View>
        {listing.freeCancellation ? (
          <Text className="mt-1 text-[11px] text-success-600 font-medium">
            Free cancellation
          </Text>
        ) : null}
      </View>
    </Pressable>
  );
}
