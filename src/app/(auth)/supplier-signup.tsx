import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import { SafeAreaView } from "@/components/ui/SafeAreaView";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { supabase } from "@/lib/supabase";

export default function SupplierSignupScreen() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  function goNext() {
    setError(null);
    if (!fullName.trim()) return setError("Please enter your full name.");
    if (!email.trim()) return setError("Please enter your email address.");
    if (password.length < 6) return setError("Password must be at least 6 characters.");
    handleSignUp();
  }

  async function handleSignUp() {
    setLoading(true);
    setError(null);
    try {
      const { error: signUpError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            role: "supplier",
            full_name: fullName.trim(),
          },
        },
      });
      if (signUpError) throw signUpError;

      router.replace({
        pathname: "/supplier-login",
        params: { signupSuccess: "1" },
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Sign up failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-surface-100">
      <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView contentContainerClassName="flex-1 justify-center px-6 py-10" keyboardShouldPersistTaps="handled">
          <Pressable onPress={() => router.back()} className="mb-4 flex-row items-center gap-1">
            <Ionicons name="chevron-back" size={20} color="#0a54d9" />
            <Text className="text-sm font-medium text-brand-600">Back</Text>
          </Pressable>

          <View className="bg-white rounded-3xl p-8 shadow-sm">
            <View className="flex-row items-center justify-center gap-2 mb-6">
              <View style={{ height: 6, width: 36, borderRadius: 100, backgroundColor: "#7c3aed" }} />
              <View style={{ height: 6, width: 16, borderRadius: 100, backgroundColor: "#e2e8f0" }} />
            </View>
            <View className="flex-row items-center justify-center gap-1.5 mb-3">
              <View style={{ backgroundColor: "#ede9fe" }} className="rounded-full px-3 py-1.5 flex-row items-center gap-1.5">
                <Ionicons name="shield-checkmark" size={14} color="#7c3aed" />
                <Text style={{ color: "#6d28d9" }} className="text-xs font-bold">TravelNest Partner Portal</Text>
              </View>
            </View>
            <Text className="text-2xl font-extrabold text-ink-900 text-center">Create Your Supplier Account</Text>
            <Text className="text-sm text-ink-500 text-center mt-1 mb-6">Start listing your tours &amp; experiences in minutes</Text>

            <View className="gap-4">
              <View>
                <Text className="text-sm font-bold text-ink-700 mb-1.5">Full Name</Text>
                <Input placeholder="Name" value={fullName} onChangeText={setFullName} />
              </View>
              <View>
                <Text className="text-sm font-bold text-ink-700 mb-1.5">Email Address</Text>
                <Input placeholder="Email" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" autoCorrect={false} />
              </View>
              <View>
                <Text className="text-sm font-bold text-ink-700 mb-1.5">Password</Text>
                <Input placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry />
              </View>

              {error ? (
                <View className="bg-danger-50 rounded-xl px-4 py-3">
                  <Text className="text-sm text-danger-600">{error}</Text>
                </View>
              ) : null}

              <Button title="Continue to Partner Setup" size="lg" block loading={loading} disabled={loading} onPress={goNext} />
            </View>
          </View>

          <View className="flex-row justify-center gap-1 mt-6">
            <Text className="text-ink-500 text-sm">Already have an account?</Text>
            <Pressable onPress={() => router.back()}>
              <Text className="font-semibold text-brand-600 text-sm"> Sign In</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
