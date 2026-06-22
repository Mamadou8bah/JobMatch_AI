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
import GlassBackground from "../../components/GlassBackground";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../services/api.js";
import { colors, radius, spacing } from "../../constants/theme";

export default function MessagesScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [threads, setThreads] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState("");

  useEffect(() => {
    api.chat.listThreads().then((data) => {
      setThreads(data);
      if (data.length) setSelectedId(data[0].id);
    });
  }, []);

  useEffect(() => {
    if (!selectedId) return;
    api.chat.listMessages(selectedId).then(setMessages);
    api.chat.markRead(selectedId).catch(() => {});
  }, [selectedId]);

  const send = async () => {
    if (!draft.trim() || !selectedId) return;
    const message = await api.chat.sendMessage(selectedId, draft.trim());
    setMessages((prev) => [...prev, message]);
    setDraft("");
    setThreads((prev) =>
      prev
        .map((thread) =>
          thread.id === selectedId
            ? {
                ...thread,
                lastMessageAt: message.createdAt || new Date().toISOString(),
                updatedAt: message.createdAt || new Date().toISOString(),
              }
            : thread
        )
        .sort(
          (a, b) =>
            new Date(b.lastMessageAt || b.updatedAt).getTime() -
            new Date(a.lastMessageAt || a.updatedAt).getTime()
        )
    );
  };

  const activeThread = threads.find((t) => t.id === selectedId);
  const peer =
    activeThread?.employer?.companyName ||
    activeThread?.employer?.fullName ||
    "Employer";

  return (
    <GlassBackground>
      <KeyboardAvoidingView
        style={{ flex: 1, paddingTop: insets.top + spacing.md, paddingBottom: 100 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <Text style={styles.title}>Messages</Text>

        <FlatList
          horizontal
          data={threads}
          keyExtractor={(item) => item.id}
          style={styles.threadList}
          contentContainerStyle={{ paddingHorizontal: spacing.lg, gap: 8 }}
          renderItem={({ item }) => (
            <Pressable
              style={[styles.threadChip, selectedId === item.id && styles.threadChipActive]}
              onPress={() => setSelectedId(item.id)}
            >
              <Text style={[styles.threadText, selectedId === item.id && styles.threadTextActive]}>
                {item.employer?.companyName || item.employer?.fullName || "Chat"}
              </Text>
            </Pressable>
          )}
        />

        <View style={styles.panel}>
          <Text style={styles.peer}>{peer}</Text>
          <FlatList
            data={messages}
            keyExtractor={(item) => item.id}
            style={styles.messages}
            contentContainerStyle={{ padding: spacing.md, gap: 10 }}
            renderItem={({ item }) => {
              const mine = item.sender?.id === user?.id;
              return (
                <View style={[styles.bubble, mine && styles.bubbleMine]}>
                  <Text style={[styles.bubbleText, mine && styles.bubbleTextMine]}>{item.content}</Text>
                </View>
              );
            }}
          />
          <View style={styles.compose}>
            <TextInput
              style={styles.input}
              value={draft}
              onChangeText={setDraft}
              placeholder="Write a message..."
              placeholderTextColor={colors.muted}
            />
            <Pressable style={styles.sendBtn} onPress={send}>
              <Text style={styles.sendText}>Send</Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </GlassBackground>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: colors.ink,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  threadList: { maxHeight: 48, marginBottom: spacing.md },
  threadChip: {
    backgroundColor: "rgba(255,255,255,0.7)",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: radius.pill,
  },
  threadChipActive: { backgroundColor: colors.primary },
  threadText: { color: colors.ink, fontWeight: "600" },
  threadTextActive: { color: "#fff" },
  panel: {
    flex: 1,
    marginHorizontal: spacing.lg,
    backgroundColor: "#fff",
    borderRadius: radius.xl,
    overflow: "hidden",
  },
  peer: { padding: spacing.md, fontWeight: "700", borderBottomWidth: 1, borderBottomColor: "#F4F4F5" },
  messages: { flex: 1 },
  bubble: {
    alignSelf: "flex-start",
    backgroundColor: "#F4F4F5",
    padding: 12,
    borderRadius: 16,
    maxWidth: "80%",
  },
  bubbleMine: { alignSelf: "flex-end", backgroundColor: colors.primary },
  bubbleText: { color: colors.ink },
  bubbleTextMine: { color: "#fff" },
  compose: {
    flexDirection: "row",
    gap: 8,
    padding: spacing.md,
    borderTopWidth: 1,
    borderTopColor: "#F4F4F5",
  },
  input: {
    flex: 1,
    backgroundColor: "#F4F4F5",
    borderRadius: radius.pill,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  sendBtn: {
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
    paddingHorizontal: 16,
    justifyContent: "center",
  },
  sendText: { color: "#fff", fontWeight: "700" },
});
