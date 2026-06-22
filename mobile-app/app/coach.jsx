import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useState } from "react";
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

const WELCOME_MESSAGE = {
  id: "welcome",
  role: "assistant",
  content: "Hi! Ask me about careers, interviews, CV tips, and job search strategy in The Gambia.",
};

export default function CoachScreen() {
  const insets = useSafeAreaInsets();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(true);

  useEffect(() => {
    api.ai
      .coachMessages()
      .then((history) => {
        setMessages(history.length ? history : [WELCOME_MESSAGE]);
      })
      .catch(() => {
        setMessages([WELCOME_MESSAGE]);
      })
      .finally(() => setHistoryLoading(false));
  }, []);

  const send = async () => {
    if (!input.trim() || loading) return;
    const question = input.trim();
    setInput("");
    const optimisticUser = {
      id: `temp-user-${Date.now()}`,
      role: "user",
      content: question,
    };
    setMessages((prev) => [...prev.filter((m) => m.id !== "welcome"), optimisticUser]);
    setLoading(true);
    try {
      const data = await api.ai.chat(question);
      setMessages((prev) => {
        const withoutOptimistic = prev.filter((m) => m.id !== optimisticUser.id);
        const next = [...withoutOptimistic];
        if (data.userMessage) next.push(data.userMessage);
        if (data.assistantMessage) next.push(data.assistantMessage);
        else if (data.response) {
          next.push({ id: `temp-ai-${Date.now()}`, role: "assistant", content: data.response });
        }
        return next.length ? next : [WELCOME_MESSAGE];
      });
    } catch {
      setMessages((prev) => prev.filter((m) => m.id !== optimisticUser.id));
    } finally {
      setLoading(false);
    }
  };

  const clearHistory = async () => {
    setLoading(true);
    try {
      await api.ai.clearCoachMessages();
      setMessages([WELCOME_MESSAGE]);
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
          <View style={styles.headerActions}>
            {messages.some((m) => m.id !== "welcome") && (
              <Pressable onPress={clearHistory} disabled={loading}>
                <Text style={styles.clearText}>Clear</Text>
              </Pressable>
            )}
            <Pressable onPress={() => router.back()}>
              <Ionicons name="close" size={24} color={colors.ink} />
            </Pressable>
          </View>
        </View>

        {historyLoading ? (
          <Text style={styles.thinking}>Loading chat...</Text>
        ) : (
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
        )}

        <View style={styles.compose}>
          <TextInput
            style={styles.input}
            value={input}
            onChangeText={setInput}
            placeholder="Ask your career question..."
            placeholderTextColor={colors.muted}
            editable={!loading && !historyLoading}
          />
          <Pressable style={styles.sendBtn} onPress={send} disabled={loading || historyLoading}>
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
  headerActions: { flexDirection: "row", alignItems: "center", gap: 16 },
  clearText: { color: colors.primary, fontWeight: "600" },
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
