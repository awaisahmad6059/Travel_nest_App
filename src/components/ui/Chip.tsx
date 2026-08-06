import { Pressable, Text } from "react-native";
import { cn } from "@/utils/cn";

export function Chip({
  label,
  selected = false,
  onPress,
  className,
}: {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  className?: string;
}) {
  return (
    <Pressable
      onPress={onPress}
      className={cn(
        "px-4 py-2 rounded-full border",
        selected
          ? "bg-ink-900 border-ink-900"
          : "bg-white border-ink-200",
        className,
      )}
    >
      <Text
        className={cn(
          "text-sm font-medium",
          selected ? "text-white" : "text-ink-700",
        )}
      >
        {label}
      </Text>
    </Pressable>
  );
}
