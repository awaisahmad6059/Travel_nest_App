import { useState } from "react";
import {
  Text,
  TextInput,
  View,
  type TextInputProps,
} from "react-native";
import { cn } from "@/utils/cn";

export interface InputProps extends TextInputProps {
  label?: string;
  error?: string | null;
  hint?: string;
}

export function Input({ label, error, hint, className, ...rest }: InputProps) {
  const [focused, setFocused] = useState(false);

  return (
    <View className={cn("gap-1.5", className)}>
      {label ? (
        <Text className="text-sm font-medium text-ink-800">{label}</Text>
      ) : null}
      <TextInput
        className={cn(
          "bg-white border rounded-xl px-4 py-3 text-base text-ink-900",
          focused ? "border-brand-500" : "border-ink-200",
          error ? "border-danger-500" : "",
        )}
        placeholderTextColor="#848d9c"
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        {...rest}
      />
      {error ? <Text className="text-sm text-danger-600">{error}</Text> : null}
      {!error && hint ? (
        <Text className="text-xs text-ink-400">{hint}</Text>
      ) : null}
    </View>
  );
}
