import type { PropsWithChildren } from "react";
import { View, type ViewProps } from "react-native";
import { cn } from "@/utils/cn";

export function Card({ children, className, ...rest }: PropsWithChildren<ViewProps>) {
  return (
    <View
      className={cn(
        "bg-white rounded-2xl border border-ink-100 overflow-hidden",
        className,
      )}
      {...rest}
    >
      {children}
    </View>
  );
}
