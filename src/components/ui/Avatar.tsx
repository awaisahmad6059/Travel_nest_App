import { Text, View } from "react-native";
import { cn } from "@/utils/cn";

export function Avatar({
  emoji,
  size = 40,
  className,
}: {
  emoji?: string;
  size?: number;
  className?: string;
}) {
  return (
    <View
      style={{ width: size, height: size, borderRadius: size / 2 }}
      className={cn(
        "bg-brand-100 items-center justify-center",
        className,
      )}
    >
      <Text style={{ fontSize: size * 0.5 }}>{emoji ?? "👤"}</Text>
    </View>
  );
}
