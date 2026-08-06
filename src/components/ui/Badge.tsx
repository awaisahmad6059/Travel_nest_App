import { Text, View } from "react-native";
import { cn } from "@/utils/cn";

export type BadgeTone = "brand" | "accent" | "success" | "warning" | "danger" | "neutral";

const toneStyles: Record<BadgeTone, string> = {
  brand: "bg-brand-50 text-brand-700",
  accent: "bg-accent-50 text-accent-700",
  success: "bg-success-50 text-success-600",
  warning: "bg-amber-50 text-amber-700",
  danger: "bg-danger-50 text-danger-600",
  neutral: "bg-ink-100 text-ink-700",
};

export function Badge({
  label,
  tone = "neutral",
  className,
}: {
  label: string;
  tone?: BadgeTone;
  className?: string;
}) {
  return (
    <View className={cn("px-2.5 py-1 rounded-full self-start", toneStyles[tone], className)}>
      <Text className="text-xs font-semibold">{label}</Text>
    </View>
  );
}
