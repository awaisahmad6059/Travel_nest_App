import { useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "@/components/ui/SafeAreaView";
import { Ionicons } from "@expo/vector-icons";

import { authApi } from "@/api/authApi";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { isValidEmail } from "@/utils/format";

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit() {
    if (!isValidEmail(email)) return setError("Please enter a valid email address.");
    setError(null);
    setSubmitting(true);
    try {
      await authApi.requestPasswordReset(email);
      setSent(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-surface-100">
      <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView contentContainerClassName="flex-1 justify-center px-6 py-10">
          <Pressable onPress={() => router.back()} className="mb-6 flex-row items-center gap-1">
            <Ionicons name="chevron-back" size={20} color="#0a54d9" />
            <Text className="text-sm font-medium text-brand-600">Back to sign in</Text>
          </Pressable>

          <Text className="text-2xl font-extrabold text-ink-900">Reset password</Text>
          <Text className="mt-1 text-sm text-ink-500 mb-6">
            Enter your account email and we'll send you a reset link.
          </Text>

          {sent ? (
            <View className="bg-success-50 rounded-2xl px-5 py-4">
              <Text className="text-sm font-semibold text-success-600">
                Check your inbox 📬
              </Text>
              <Text className="mt-1 text-sm text-success-600">
                If an account exists for {email}, a reset link is on its way. (Mock
                demo — no email is actually sent.)
              </Text>
            </View>
          ) : (
            <View className="gap-4">
              <Input
                label="Email"
                placeholder="you@example.com"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="email-address"
              />
              {error ? (
                <View className="bg-danger-50 rounded-xl px-4 py-3">
                  <Text className="text-sm text-danger-600">{error}</Text>
                </View>
              ) : null}
              <Button title="Send reset link" size="lg" block loading={submitting} onPress={onSubmit} />
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
