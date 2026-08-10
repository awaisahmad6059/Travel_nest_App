import { Image } from "expo-image";
import { Text, View } from "react-native";
import { TONE_BARS } from "@/mocks/placeholders";
import { cn } from "@/utils/cn";
import type { Thumbnail } from "@/types";

/**
 * Renders a listing image. If a real `url` exists it renders an Image;
 * otherwise it falls back to the colored placeholder (pre-Cloudinary).
 */
export function ListingImage({
  thumbnail,
  url,
  className,
}: {
  thumbnail: Thumbnail;
  url?: string;
  className?: string;
}) {
  if (url) {
    return (
      <View className={cn("overflow-hidden", className)}>
        <Image
          source={{ uri: url }}
          className="w-full h-full"
          style={{ width: "100%", height: "100%" }}
          contentFit="cover"
        />
      </View>
    );
  }
  return (
    <View
      className={cn(
        "items-center justify-center overflow-hidden",
        TONE_BARS[thumbnail.tone],
        className,
      )}
    >
      <Text className="text-5xl">{thumbnail.emoji}</Text>
      <Text className="mt-1 px-2 text-center text-xs font-bold text-white">
        {thumbnail.label}
      </Text>
    </View>
  );
}
