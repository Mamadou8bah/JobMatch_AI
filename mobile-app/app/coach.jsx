import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import GlassBackground from "../components/GlassBackground";
import { api } from "../services/api.js";
import { colors, radius, spacing } from "../constants/theme";

export default function CoachScreen() {
  const insets = useSafeAreaInsets();
  const [messages, setMessages] = useState([
    {
      id: "welcome",
      role: "assistant",
      content: "Hi! Ask me about careers, interviews, CV tips, and job search strategy in The Gambia.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const send = async () => {
    if (!input.trim()) return;
    const question = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { id: Date.now().toString(), role: "user", content: question }]);
    setLoading(true);
    try {
      const data = await api.ai.chat(question);
      setMessages((prev) => [
        ...prev,
        { id: `${Date.now()}-a`, role: "assistant", content: data.response },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <GlassBackground>
      <KeyboardAvoidingView
        style={{ flex: 1, paddingTop: insets.top + spacing.md }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.header}>
          <Text style={styles.title}>AI Career Coach</Text>
          <Pressable onPress={() => router.back()}>
            <Ionicons name="close" size={24} color={colors.ink} />
          </Pressable>
        </View>

        <FlatList
          data={messages}
          keyExtractor={(item) => item.id}
          style={styles.list}
          contentContainerStyle={{ padding: spacing.lg, gap: 10 }}
          renderItem={({ item }) => (
            <View style={[styles.bubble, item.role === "user" && styles.bubbleUser]}>
              <Text style={[styles.bubbleText, item.role === "user" && styles.bubbleTextUser]}>
                {item.content}
              </Text>
            </View>
          )}
          ListFooterComponent={loading ? <Text style={styles.thinking}>Thinking...</Text> : null}
        />

        <View style={styles.compose}>
          <TextInput
            style={styles.input}
            value={input}
            onChangeText={setInput}
            placeholder="Ask your career question..."
            placeholderTextColor={colors.muted}
          />
          <Pressable style={styles.sendBtn} onPress={send}>
            <Text style={styles.sendText}>Ask</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </GlassBackground>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.sm,
  },
  title: { fontSize: 22, fontWeight: "800", color: colors.ink },
  list: { flex: 1 },
  bubble: {
    alignSelf: "flex-start",
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 18,
    maxWidth: "85%",
  },
  bubbleUser: { alignSelf: "flex-end", backgroundColor: colors.primary },
  bubbleText: { color: colors.ink, lineHeight: 21 },
  bubbleTextUser: { color: "#fff" },
  thinking: { color: colors.muted, paddingHorizontal: spacing.lg },
  compose: {
    flexDirection: "row",
    gap: 8,
    padding: spacing.lg,
    paddingBottom: spacing.xl,
  },
  input: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: radius.pill,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  sendBtn: {
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
    paddingHorizontal: 18,
    justifyContent: "center",
  },
  sendText: { color: "#fff", fontWeight: "700" },
});
