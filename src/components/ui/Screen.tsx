import { PropsWithChildren } from "react";
import { ScrollView, View, type ScrollViewProps } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { cn } from "@/utils/cn";

/**
 * Standard screen wrapper: safe area + optional scroll + page background.
 */
export function Screen({
  children,
  scroll = true,
  className,
  contentContainerClassName,
  ...rest
}: PropsWithChildren<
  ScrollViewProps & {
    scroll?: boolean;
    className?: string;
    contentContainerClassName?: string;
  }
>) {
  const content = (
    <View className={cn("flex-1 bg-surface-100", className)}>
      {scroll ? (
        <ScrollView
          contentContainerClassName={cn("pb-8", contentContainerClassName)}
          showsVerticalScrollIndicator={false}
          {...rest}
        >
          {children}
        </ScrollView>
      ) : (
        <View className="flex-1" {...(rest as object)}>
          {children}
        </View>
      )}
    </View>
  );

  return <SafeAreaView className="flex-1 bg-surface-100">{content}</SafeAreaView>;
}
