import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert, Image, Pressable, Text, View } from "react-native";

import { useSession } from "@/auth/sessionStore";
import { SubScreenHeader } from "@/components/profile/SubScreenHeader";
import { SafeAreaView } from "@/components/ui/SafeAreaView";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useProfileStore } from "@/store/profileStore";

export default function EditProfileScreen() {
  const router = useRouter();
  const { user } = useSession();
  const { displayName, avatarUri, setDisplayName, setAvatarUri } = useProfileStore();

  const [name, setName] = useState(displayName ?? user?.name ?? "");
  const [saving, setSaving] = useState(false);

  async function pickPhoto() {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(
        "Permission needed",
        "Allow photo library access to pick a profile picture.",
      );
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.6,
    });
    if (!result.canceled && result.assets[0]) {
      setAvatarUri(result.assets[0].uri);
    }
  }

  async function save() {
    const trimmed = name.trim();
    if (!trimmed) {
      Alert.alert("Display name required", "Please enter a display name.");
      return;
    }
    setSaving(true);
    setDisplayName(trimmed);
    setSaving(false);
    router.back();
  }

  return (
    <SafeAreaView className="flex-1 bg-surface-100">
      <SubScreenHeader title="Edit profile" />

      <View className="px-5 gap-6">
        <View className="items-center gap-3 pt-2">
          <Pressable onPress={() => void pickPhoto()}>
            {avatarUri ? (
              <Image
                source={{ uri: avatarUri }}
                style={{ width: 96, height: 96, borderRadius: 48 }}
              />
            ) : (
              <Avatar emoji={user?.avatarEmoji} size={96} className="border border-ink-100" />
            )}
          </Pressable>
          <Pressable onPress={() => void pickPhoto()} hitSlop={6}>
            <Text className="text-sm font-semibold text-brand-600">
              <Ionicons name="camera-outline" size={14} /> Change photo
            </Text>
          </Pressable>
          {avatarUri ? (
            <Pressable onPress={() => setAvatarUri(null)} hitSlop={6}>
              <Text className="text-sm font-semibold text-danger-500">Remove photo</Text>
            </Pressable>
          ) : null}
        </View>

        <View className="gap-4">
          <Input
            label="Display name"
            value={name}
            onChangeText={setName}
            placeholder="Your name"
          />
          <View>
            <Text className="text-sm font-medium text-ink-800 mb-1.5">Email</Text>
            <View className="bg-ink-50 border border-ink-100 rounded-xl px-4 py-3">
              <Text className="text-base text-ink-400">{user?.email}</Text>
            </View>
          </View>
          <Text className="text-xs text-ink-400">
            Your display name is saved on this device. The photo is kept for this session.
          </Text>
        </View>

        <Button title="Save changes" onPress={save} loading={saving} block />
      </View>
    </SafeAreaView>
  );
}
