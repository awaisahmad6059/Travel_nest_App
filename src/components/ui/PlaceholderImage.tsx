import { Text, View } from "react-native";
import { TONE_STYLES } from "@/mocks/placeholders";
import { cn } from "@/utils/cn";
import type { ImageTone } from "@/types";

/**
 * Colored placeholder used for every image until Cloudinary URLs are wired up.
 * Pass `emoji` + `label` to make cards look intentional, and `tone` for variety.
 */
export function PlaceholderImage({
  emoji,
  label,
  tone = "slate",
  className,
}: {
  emoji?: string;
  label?: string;
  tone?: ImageTone;
  className?: string;
}) {
  return (
    <View className={cn("items-center justify-center", TONE_STYLES[tone], className)}>
      <Text className="text-4xl">{emoji ?? "📍"}</Text>
      {label ? (
        <Text className="mt-1 px-2 text-center text-xs font-semibold text-ink-600">
          {label}
        </Text>
      ) : null}
    </View>
  );
}
