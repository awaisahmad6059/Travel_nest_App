import { Text, View, type ViewProps } from "react-native";
import { cn } from "@/utils/cn";

export function SectionHeader({
  title,
  subtitle,
  right,
  className,
  ...rest
}: ViewProps & {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
}) {
  return (
    <View className={cn("flex-row items-center justify-between px-5 mb-3", className)} {...rest}>
      <View className="flex-1">
        <Text className="text-lg font-bold text-ink-900">{title}</Text>
        {subtitle ? <Text className="text-sm text-ink-500 mt-0.5">{subtitle}</Text> : null}
      </View>
      {right ? <View className="ml-3">{right}</View> : null}
    </View>
  );
}
