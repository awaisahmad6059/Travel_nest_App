import { forwardRef, useMemo } from "react";
import {
  ActivityIndicator,
  Pressable,
  Text,
  type PressableProps,
  type ViewStyle,
} from "react-native";
import { cn } from "@/utils/cn";

export type ButtonVariant =
  | "primary"
  | "accent"
  | "secondary"
  | "ghost"
  | "danger"
  | "outline-danger"
  | "disabled";

export type ButtonSize = "sm" | "md" | "lg";

const variantStyles: Record<ButtonVariant, string> = {
  primary: "bg-brand-600 active:bg-brand-700",
  accent: "bg-accent-500 active:bg-accent-600",
  secondary: "bg-white border border-ink-200 active:bg-ink-50",
  ghost: "bg-transparent active:bg-ink-50",
  danger: "bg-danger-500 active:bg-danger-600",
  "outline-danger": "bg-transparent border border-danger-300 active:bg-danger-50",
  disabled: "bg-ink-200",
};

const textStyles: Record<ButtonVariant, string> = {
  primary: "text-white",
  accent: "text-white",
  secondary: "text-ink-900",
  ghost: "text-brand-600",
  danger: "text-white",
  "outline-danger": "text-danger-600",
  disabled: "text-ink-400",
};

const sizeStyles: Record<ButtonSize, { button: string; text: string }> = {
  sm: { button: "px-4 py-2 rounded-lg", text: "text-sm font-semibold" },
  md: { button: "px-5 py-3 rounded-xl", text: "text-base font-semibold" },
  lg: { button: "px-6 py-4 rounded-xl", text: "text-base font-bold" },
};

export interface ButtonProps extends Omit<PressableProps, "style"> {
  title: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  block?: boolean;
  style?: ViewStyle;
}

export const Button = forwardRef<never, ButtonProps>(function Button(
  {
    title,
    variant = "primary",
    size = "md",
    loading = false,
    block = false,
    disabled,
    style,
    className,
    ...rest
  },
  ref,
) {
  const effectiveVariant: ButtonVariant =
    disabled && variant !== "ghost" ? "disabled" : variant;
  const s = sizeStyles[size];

  const content = useMemo(() => {
    if (loading) {
      const spinnerColor: Record<string, string> = {
        primary: "#ffffff",
        accent: "#ffffff",
        danger: "#ffffff",
        secondary: "#0a54d9",
        ghost: "#0a54d9",
        "outline-danger": "#e11d48",
        disabled: "#ffffff",
      };
      return (
        <ActivityIndicator color={spinnerColor[effectiveVariant] ?? "#ffffff"} />
      );
    }
    return (
      <Text className={cn(s.text, textStyles[effectiveVariant], "text-center")}>
        {title}
      </Text>
    );
  }, [loading, title, s.text, effectiveVariant]);

  return (
    <Pressable
      ref={ref}
      disabled={disabled || loading}
      className={cn(
        "will-change-pressable",
        "flex-row items-center justify-center",
        s.button,
        variantStyles[effectiveVariant],
        block && "self-stretch",
        className,
      )}
      style={style}
      {...rest}
    >
      {content}
    </Pressable>
  );
});
