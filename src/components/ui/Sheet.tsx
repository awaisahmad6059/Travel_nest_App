import { type PropsWithChildren, type ReactNode } from "react";
import { Modal, Pressable, ScrollView, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

/**
 * Simple bottom sheet built on React Native's Modal. Used for the search
 * filters and any future option pickers.
 *
 * Pass `footer` to render a fixed row below the scrollable content (e.g. a
 * sticky action button that stays visible regardless of scroll position).
 */
export function Sheet({
  visible,
  title,
  onClose,
  children,
  footer,
}: PropsWithChildren<{
  visible: boolean;
  title: string;
  onClose: () => void;
  footer?: ReactNode;
}>) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View className="flex-1 justify-end">
        <Pressable className="absolute inset-0 bg-black/40" onPress={onClose} />
        <View className="bg-white rounded-t-3xl">
          <View className="items-center pt-3 pb-1">
            <View className="h-1 w-10 rounded-full bg-ink-200" />
          </View>
          <View className="flex-row items-center justify-between px-5 py-3">
            <Text className="text-lg font-bold text-ink-900">{title}</Text>
            <Pressable onPress={onClose} hitSlop={8}>
              <Ionicons name="close" size={22} color="#4d5565" />
            </Pressable>
          </View>
          <ScrollView
            className="max-h-[70%] px-5 pb-8"
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {children}
          </ScrollView>
          {footer ? (
            <View className="border-t border-ink-100 bg-white px-5 py-4 pb-6">
              {footer}
            </View>
          ) : null}
        </View>
      </View>
    </Modal>
  );
}
