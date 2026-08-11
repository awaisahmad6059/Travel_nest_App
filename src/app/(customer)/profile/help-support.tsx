import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";

import { SubScreenHeader } from "@/components/profile/SubScreenHeader";
import { SafeAreaView } from "@/components/ui/SafeAreaView";
import { cn } from "@/utils/cn";

const FAQS = [
  {
    q: "How do I get a refund?",
    a: "Refunds follow each listing's cancellation policy shown on the experience page. Open the booking and choose 'Cancel booking' to start the process.",
  },
  {
    q: "Can I change the date of my booking?",
    a: "Yes — date changes depend on the supplier's availability. Contact the supplier through the booking screen or chat with support and we'll help you reschedule.",
  },
  {
    q: "How do I check in with my voucher?",
    a: "Open the booking from the Bookings tab and show the QR voucher code to the supplier on the day. The code is stored on your device, so it works offline.",
  },
  {
    q: "When will I be charged?",
    a: "You're charged once at checkout. Payment is processed securely and the voucher is generated immediately after confirmation.",
  },
  {
    q: "How do I contact a supplier?",
    a: "Each confirmed booking has a message thread. You can also use the chat on this screen and we'll route your question to the right team.",
  },
];

interface ChatMessage {
  id: string;
  from: "agent" | "user";
  text: string;
}

const SEED_MESSAGES: ChatMessage[] = [
  {
    id: "m1",
    from: "agent",
    text: "Hi 👋 Thanks for reaching out to TravelNest support. How can we help?",
  },
  {
    id: "m2",
    from: "agent",
    text: "You can also browse the FAQ below for quick answers while you wait.",
  },
];

const AUTO_REPLIES = [
  "Thanks for your message — a support agent will get back to you shortly.",
  "Got it! In the meantime, check the FAQ below or try the booking screen.",
  "Noted. Our team usually replies within a few minutes.",
];

export default function HelpSupportScreen() {
  const [openFaq, setOpenFaq] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>(SEED_MESSAGES);
  const [draft, setDraft] = useState("");
  const [typing, setTyping] = useState(false);
  const replyIndex = messages.filter((m) => m.from === "user").length;

  function send() {
    const text = draft.trim();
    if (!text) return;
    setMessages((prev) => [...prev, { id: `u_${Date.now()}`, from: "user", text }]);
    setDraft("");
    setTyping(true);
    const reply = AUTO_REPLIES[replyIndex % AUTO_REPLIES.length];
    setTimeout(() => {
      setMessages((prev) => [...prev, { id: `a_${Date.now()}`, from: "agent", text: reply }]);
      setTyping(false);
    }, 900);
  }

  return (
    <SafeAreaView className="flex-1 bg-surface-100">
      <SubScreenHeader title="Help & support" />

      <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
        {/* FAQ */}
        <Text className="mt-1 mb-2 text-sm font-bold text-ink-800">Frequently asked questions</Text>
        <View className="bg-white rounded-2xl border border-ink-100 overflow-hidden">
          {FAQS.map((faq) => {
            const open = openFaq === faq.q;
            return (
              <Pressable
                key={faq.q}
                onPress={() => setOpenFaq(open ? null : faq.q)}
                className="border-b border-ink-100 px-4 py-3.5"
              >
                <View className="flex-row items-center gap-3">
                  <Text className="flex-1 text-sm font-semibold text-ink-900">{faq.q}</Text>
                  <Ionicons
                    name={open ? "chevron-up" : "chevron-down"}
                    size={18}
                    color="#848d9c"
                  />
                </View>
                {open ? (
                  <Text className="mt-2 text-sm text-ink-500 leading-5">{faq.a}</Text>
                ) : null}
              </Pressable>
            );
          })}
        </View>

        {/* Chat */}
        <Text className="mt-6 mb-2 text-sm font-bold text-ink-800">Chat with support</Text>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          className="bg-white rounded-2xl border border-ink-100 overflow-hidden"
        >
          <View className="p-4 gap-3">
            {messages.map((m) => (
              <View
                key={m.id}
                className={cn(
                  "max-w-[80%] rounded-2xl px-4 py-2.5",
                  m.from === "user"
                    ? "self-end bg-brand-600"
                    : "self-start bg-ink-100",
                )}
              >
                <Text
                  className={cn(
                    "text-sm leading-5",
                    m.from === "user" ? "text-white" : "text-ink-800",
                  )}
                >
                  {m.text}
                </Text>
              </View>
            ))}
            {typing ? (
              <View className="self-start bg-ink-100 rounded-2xl px-4 py-2.5">
                <Text className="text-sm text-ink-500 italic">Support is typing…</Text>
              </View>
            ) : null}
          </View>

          <View className="flex-row items-center gap-2 border-t border-ink-100 px-3 py-2.5">
            <TextInput
              value={draft}
              onChangeText={setDraft}
              placeholder="Type a message…"
              placeholderTextColor="#848d9c"
              multiline
              className="flex-1 bg-ink-50 rounded-xl px-3 py-2 text-sm text-ink-900 max-h-24"
            />
            <Pressable
              onPress={send}
              disabled={!draft.trim()}
              className="h-10 w-10 rounded-full bg-brand-600 items-center justify-center disabled:bg-ink-200"
            >
              <Ionicons name="send" size={16} color="#ffffff" />
            </Pressable>
          </View>
        </KeyboardAvoidingView>

        <Text className="text-center text-xs text-ink-400 mt-6 mb-8">
          Demo chat — replies are canned. Live agent routing arrives with the backend messaging module.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}
