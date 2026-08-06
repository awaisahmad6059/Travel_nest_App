import { forwardRef } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export interface SearchBarProps {
  value?: string;
  placeholder?: string;
  onChangeText?: (text: string) => void;
  onSubmit?: () => void;
  onFocus?: () => void;
  autoFocus?: boolean;
  /** When true the bar is a button that navigates to the search screen. */
  interactive?: boolean;
}

/**
 * Search bar used on the Home screen (non-editable, navigates to Search) and
 * the Search screen (editable).
 */
export const SearchBar = forwardRef<View, SearchBarProps>(function SearchBar(
  {
    value,
    placeholder = "Search experiences & destinations",
    onChangeText,
    onSubmit,
    onFocus,
    autoFocus,
    interactive,
  },
  ref,
) {
  if (interactive) {
    return (
      <Pressable
        ref={ref}
        onPress={onFocus}
        className="flex-row items-center bg-white border border-ink-200 rounded-2xl px-4 py-3.5"
      >
        <Ionicons name="search" size={20} color="#66707f" />
        <Text className="ml-2.5 text-base text-ink-400 flex-1" numberOfLines={1}>
          {placeholder}
        </Text>
      </Pressable>
    );
  }
  return (
    <TextInputShell
      ref={ref}
      value={value}
      placeholder={placeholder}
      onChangeText={onChangeText}
      onSubmit={onSubmit}
      onFocus={onFocus}
      autoFocus={autoFocus}
    />
  );
});

const TextInputShell = forwardRef<View, SearchBarProps>(function TextInputShell(
  { value, placeholder, onChangeText, onSubmit, onFocus, autoFocus },
  ref,
) {
  return (
    <View
      ref={ref}
      className="flex-row items-center bg-white border border-ink-200 rounded-2xl px-4 py-1"
    >
      <Ionicons name="search" size={20} color="#66707f" />
      <TextInput
        className="flex-1 ml-2.5 py-3 text-base text-ink-900"
        placeholder={placeholder}
        placeholderTextColor="#848d9c"
        value={value}
        onChangeText={onChangeText}
        onSubmitEditing={onSubmit}
        onFocus={onFocus}
        autoFocus={autoFocus}
        returnKeyType="search"
        autoCorrect={false}
      />
      {value ? (
        <Pressable onPress={() => onChangeText?.("")}>
          <Ionicons name="close-circle" size={18} color="#b0b8c4" />
        </Pressable>
      ) : null}
    </View>
  );
});
