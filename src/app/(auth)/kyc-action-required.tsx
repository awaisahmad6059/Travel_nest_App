import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  View,
} from "react-native";

import { useSession } from "@/auth/sessionStore";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Screen } from "@/components/ui/Screen";
import { supabase } from "@/lib/supabase";

interface Props {
  feedback: string[];
  userId: string;
}

export default function ActionRequiredScreen({ feedback, userId }: Props) {
  const router = useRouter();
  const { signOut } = useSession();
  const [location, setLocation] = useState("");
  const [phone, setPhone] = useState("");
  const [cnic, setCnic] = useState("");
  const [taxId, setTaxId] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  async function handleResubmit() {
    if (!location.trim() || !phone.trim() || !cnic.trim()) {
      Alert.alert("Missing Fields", "Please fill in Location, Phone, and CNIC/Reg Number.");
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase
        .from("supplier_kyc_records")
        .update({
          location: location.trim(),
          phone: phone.trim(),
          business_reg: cnic.trim(),
          tax_id: taxId.trim(),
          status: "PENDING",
          audit_reasons: [],
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", userId);

      if (error) throw error;
      setSubmitted(true);
    } catch (e) {
      Alert.alert("Error", e instanceof Error ? e.message : "Failed to resubmit. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <Screen contentContainerClassName="flex-1 justify-center px-6 py-10">
        <View className="items-center mb-8">
          <View
            className="h-24 w-24 rounded-full items-center justify-center mb-6"
            style={{ backgroundColor: "#ecfdf5" }}
          >
            <Ionicons name="checkmark-circle-outline" size={48} color="#059669" />
          </View>
          <Text className="text-2xl font-extrabold text-ink-900 text-center mb-2">
            Application Re-submitted
          </Text>
          <Text className="text-base text-ink-500 text-center leading-6">
            Your updated application is now under review again. Our team will get back to you within 24 hours.
          </Text>
        </View>
        <Button
          title="Back to Login"
          size="lg"
          block
          variant="secondary"
          onPress={() => signOut()}
        />
      </Screen>
    );
  }

  return (
    <Screen contentContainerClassName="flex-1 px-6 py-10">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
          <View className="items-center mb-6">
            <View
              className="h-24 w-24 rounded-full items-center justify-center mb-6"
              style={{ backgroundColor: "#fef3c7" }}
            >
              <Ionicons name="warning-outline" size={48} color="#d97706" />
            </View>
            <Text className="text-2xl font-extrabold text-ink-900 text-center mb-2">
              Action Required
            </Text>
            <Text className="text-base text-ink-500 text-center leading-6">
              Our review team found issues with your application that need to be fixed before we can approve your account.
            </Text>
          </View>

          {feedback.length > 0 && (
            <View className="bg-amber-50 rounded-2xl border border-amber-200 p-5 mb-6">
              <View className="flex-row items-center gap-2 mb-3">
                <Ionicons name="chatbubble-outline" size={18} color="#d97706" />
                <Text className="text-sm font-bold text-amber-800">
                  Admin Feedback
                </Text>
              </View>
              <View className="gap-2">
                {feedback.map((item, idx) => (
                  <View key={idx} className="flex-row items-start gap-2">
                    <Text className="text-amber-600 text-sm mt-0.5">•</Text>
                    <Text className="text-sm text-amber-700 flex-1 leading-5">
                      {item}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          <View className="bg-white rounded-2xl border border-ink-100 p-5 mb-6 gap-4">
            <Text className="text-sm font-bold text-ink-800">
              Please update your details below
            </Text>
            <View>
              <Text className="text-xs font-bold text-ink-500 mb-1">Location (City, Country)</Text>
              <Input value={location} onChangeText={setLocation} placeholder="e.g. Lahore, Pakistan" />
            </View>
            <View>
              <Text className="text-xs font-bold text-ink-500 mb-1">Phone Number</Text>
              <Input value={phone} onChangeText={setPhone} placeholder="+92 300 1234567" keyboardType="phone-pad" />
            </View>
            <View>
              <Text className="text-xs font-bold text-ink-500 mb-1">CNIC / Business Reg Number</Text>
              <Input value={cnic} onChangeText={setCnic} placeholder="e.g. 35202-1234567-1" />
            </View>
            <View>
              <Text className="text-xs font-bold text-ink-500 mb-1">Tax ID / NTN</Text>
              <Input value={taxId} onChangeText={setTaxId} placeholder="Tax Registration Number" />
            </View>
          </View>

          <Button
            title="Re-submit Application"
            size="lg"
            block
            loading={loading}
            onPress={handleResubmit}
            className="mb-4"
          />
          <Button
            title="Back to Login"
            size="lg"
            block
            variant="secondary"
            onPress={() => signOut()}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}
