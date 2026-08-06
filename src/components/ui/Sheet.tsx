import { PropsWithChildren } from "react";
import { Modal, Pressable, ScrollView, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

/**
 * Simple bottom sheet built on React Native's Modal. Used for the search
 * filters and any future option pickers.
 */
export function Sheet({
  visible,
  title,
  onClose,
  children,
}: PropsWithChildren<{
  visible: boolean;
  title: string;
  onClose: () => void;
}>) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable className="flex-1 bg-black/40 justify-end" onPress={onClose}>
        <Pressable className="bg-white rounded-t-3xl" onPress={(e) => e.stopPropagation()}>
          <View className="items-center pt-3 pb-1">
            <View className="h-1 w-10 rounded-full bg-ink-200" />
          </View>
          <View className="flex-row items-center justify-between px-5 py-3">
            <Text className="text-lg font-bold text-ink-900">{title}</Text>
            <Pressable onPress={onClose} hitSlop={8}>
              <Ionicons name="close" size={22} color="#4d5565" />
            </Pressable>
          </View>
          <ScrollView className="max-h-[70%] px-5 pb-8">{children}</ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
