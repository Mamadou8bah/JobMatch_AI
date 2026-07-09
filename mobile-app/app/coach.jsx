import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
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
import GlassPanel from "../components/GlassPanel";
import PrimaryButton from "../components/PrimaryButton";
import ScreenBackground from "../components/ScreenBackground";
import { SkeletonBox } from "../components/Skeleton";
import { api } from "../services/api.js";
import { colors, glass, radius, spacing } from "../constants/theme";

const WELCOME_MESSAGE = {
  id: "welcome",
  role: "assistant",
  content:
    "Hi! I'm your AI Career Coach. Ask me about CVs, interviews, skills, and job search strategy in The Gambia.",
  createdAt: new Date().toISOString(),
};

const SUGGESTED_PROMPTS = [
  { icon: "document-text-outline", text: "How can I improve my CV?" },
  { icon: "mic-outline", text: "Interview tips for my field" },
  { icon: "trending-up-outline", text: "Skills in demand in The Gambia" },
  { icon: "mail-outline", text: "Help me write a cover letter" },
];

function formatTime(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function TypingIndicator() {
  const dot1 = useRef(new Animated.Value(0.3)).current;
  const dot2 = useRef(new Animated.Value(0.3)).current;
  const dot3 = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animate = (dot, delay) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(dot, { toValue: 1, duration: 320, useNativeDriver: true }),
          Animated.timing(dot, { toValue: 0.3, duration: 320, useNativeDriver: true }),
        ])
      );

    const loops = [animate(dot1, 0), animate(dot2, 160), animate(dot3, 320)];
    loops.forEach((l) => l.start());
    return () => loops.forEach((l) => l.stop());
  }, [dot1, dot2, dot3]);

  return (
    <View style={styles.typingRow}>
      <View style={styles.botBadge}>
        <Ionicons name="sparkles" size={14} color={colors.primary} />
      </View>
      <GlassPanel borderRadius={18} contentStyle={styles.typingBubble}>
        {[dot1, dot2, dot3].map((dot, i) => (
          <Animated.View key={i} style={[styles.typingDot, { opacity: dot }]} />
        ))}
      </GlassPanel>
    </View>
  );
}

function HistorySkeleton() {
  return (
    <View style={styles.skeletonWrap}>
      <View style={styles.skeletonRow}>
        <SkeletonBox width={32} height={32} borderRadius={16} />
        <SkeletonBox width="72%" height={56} borderRadius={16} />
      </View>
      <View style={[styles.skeletonRow, styles.skeletonRowUser]}>
        <SkeletonBox width="55%" height={44} borderRadius={16} />
      </View>
    </View>
  );
}

export default function CoachScreen() {
  const insets = useSafeAreaInsets();
  const listRef = useRef(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [quota, setQuota] = useState(null);
  const [premiumBlocked, setPremiumBlocked] = useState(false);
  const [error, setError] = useState("");

  const showSuggestions =
    !historyLoading &&
    !premiumBlocked &&
    messages.length <= 1 &&
    messages.every((m) => m.id === "welcome" || m.role === "assistant");

  useEffect(() => {
    api.billing
      .me()
      .then((status) => setQuota(status.features?.coachChat || null))
      .catch(() => {});

    api.ai
      .coachMessages()
      .then((history) => {
        setMessages(history.length ? history : [WELCOME_MESSAGE]);
      })
      .catch(() => setMessages([WELCOME_MESSAGE]))
      .finally(() => setHistoryLoading(false));
  }, []);

  useEffect(() => {
    if (!historyLoading && messages.length) {
      setTimeout(() => listRef.current?.scrollToEnd({ animated: false }), 60);
    }
  }, [historyLoading, messages.length, loading]);

  const sendMessage = async (text) => {
    const question = text.trim();
    if (!question || loading || premiumBlocked || historyLoading) return;

    setInput("");
    setError("");
    const optimisticUser = {
      id: `temp-user-${Date.now()}`,
      role: "user",
      content: question,
      createdAt: new Date().toISOString(),
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
          next.push({
            id: `temp-ai-${Date.now()}`,
            role: "assistant",
            content: data.response,
            createdAt: new Date().toISOString(),
          });
        }
        return next.length ? next : [WELCOME_MESSAGE];
      });
      api.billing
        .me()
        .then((status) => setQuota(status.features?.coachChat || null))
        .catch(() => {});
    } catch (err) {
      setMessages((prev) => prev.filter((m) => m.id !== optimisticUser.id));
      if (err.isPremiumRequired) {
        setPremiumBlocked(true);
        setError(err.message || "Daily free coach limit reached. Upgrade for unlimited chats.");
      } else {
        setError(err.message || "Could not send message.");
      }
    } finally {
      setLoading(false);
    }
  };

  const renderMessage = ({ item }) => {
    const isUser = item.role === "user";

    if (isUser) {
      return (
        <View style={styles.messageRowUser}>
          <View style={styles.userBubble}>
            <Text style={styles.userBubbleText}>{item.content}</Text>
            <Text style={styles.bubbleTimeUser}>{formatTime(item.createdAt)}</Text>
          </View>
        </View>
      );
    }

    return (
      <View style={styles.messageRow}>
        <View style={styles.botBadge}>
          <Ionicons name="sparkles" size={14} color={colors.primary} />
        </View>
        <GlassPanel borderRadius={18} style={styles.assistantPanel} contentStyle={styles.assistantBubble}>
          <Text style={styles.assistantLabel}>Career Coach</Text>
          <Text style={styles.assistantBubbleText}>{item.content}</Text>
          <Text style={styles.bubbleTime}>{formatTime(item.createdAt)}</Text>
        </GlassPanel>
      </View>
    );
  };

  return (
    <ScreenBackground>
      <View style={[styles.header, { paddingTop: insets.top + spacing.md }]}>
        <GlassPanel borderRadius={radius.xl} contentStyle={styles.headerCard}>
          <View style={styles.headerAvatar}>
            <Ionicons name="sparkles" size={24} color="#fff" />
          </View>
          <View style={styles.headerInfo}>
            <Text style={styles.headerTitle}>AI Career Coach</Text>
            <Text style={styles.headerSub}>
              {loading ? "Thinking…" : "Personal job search assistant"}
            </Text>
          </View>
          <Pressable style={styles.premiumBtn} onPress={() => router.push("/billing")}>
            <Ionicons name="diamond-outline" size={18} color={colors.primary} />
          </Pressable>
        </GlassPanel>

        {quota && quota.limit != null ? (
          <View style={styles.quotaRow}>
            <View style={styles.quotaTrack}>
              <View
                style={[
                  styles.quotaFill,
                  { width: `${Math.min(100, (quota.used / quota.limit) * 100)}%` },
                ]}
              />
            </View>
            <Text style={styles.quotaText}>
              {quota.used}/{quota.limit} free today
            </Text>
          </View>
        ) : null}
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        {historyLoading ? (
          <HistorySkeleton />
        ) : (
          <FlatList
            ref={listRef}
            data={messages}
            keyExtractor={(item) => item.id}
            renderItem={renderMessage}
            style={styles.list}
            contentContainerStyle={styles.messageList}
            onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
            ListHeaderComponent={
              showSuggestions ? (
                <View style={styles.suggestions}>
                  <Text style={styles.suggestionsTitle}>Quick prompts</Text>
                  <View style={styles.chipGrid}>
                    {SUGGESTED_PROMPTS.map((prompt) => (
                      <Pressable
                        key={prompt.text}
                        onPress={() => sendMessage(prompt.text)}
                        disabled={loading || premiumBlocked}
                        style={styles.chipPress}
                      >
                        <GlassPanel borderRadius={radius.lg} contentStyle={styles.chip}>
                          <Ionicons name={prompt.icon} size={18} color={colors.primary} />
                          <Text style={styles.chipText}>{prompt.text}</Text>
                        </GlassPanel>
                      </Pressable>
                    ))}
                  </View>
                </View>
              ) : null
            }
            ListFooterComponent={
              <>
                {loading ? <TypingIndicator /> : null}
                {premiumBlocked ? (
                  <GlassPanel borderRadius={radius.xl} contentStyle={styles.gate}>
                    <View style={styles.gateIcon}>
                      <Ionicons name="lock-closed" size={20} color={colors.primary} />
                    </View>
                    <Text style={styles.gateTitle}>Daily limit reached</Text>
                    <Text style={styles.gateText}>
                      {error || "Upgrade to Premium for unlimited AI coaching."}
                    </Text>
                    <PrimaryButton title="Upgrade to Premium" onPress={() => router.push("/billing")} />
                  </GlassPanel>
                ) : null}
                {error && !premiumBlocked ? (
                  <View style={styles.errorBox}>
                    <Ionicons name="alert-circle" size={16} color={colors.error} />
                    <Text style={styles.errorText}>{error}</Text>
                  </View>
                ) : null}
              </>
            }
          />
        )}

        <View style={[styles.compose, { paddingBottom: Math.max(insets.bottom, 10) + 72 }]}>
          <GlassPanel borderRadius={radius.pill} style={styles.inputShell} contentStyle={styles.inputWrap}>
            <TextInput
              style={styles.input}
              value={input}
              onChangeText={setInput}
              placeholder="Ask about careers, CVs, interviews…"
              placeholderTextColor={colors.muted}
              multiline
              maxLength={1000}
              editable={!loading && !historyLoading && !premiumBlocked}
            />
          </GlassPanel>
          <Pressable
            style={[
              styles.sendBtn,
              (!input.trim() || loading || historyLoading || premiumBlocked) && styles.sendBtnDisabled,
            ]}
            onPress={() => sendMessage(input)}
            disabled={!input.trim() || loading || historyLoading || premiumBlocked}
          >
            <Ionicons name="arrow-up" size={20} color="#fff" />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  header: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
  },
  headerCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: spacing.md,
  },
  headerAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: glass.border,
  },
  headerInfo: { flex: 1 },
  headerTitle: { fontSize: 18, fontWeight: "800", color: colors.ink },
  headerSub: { color: colors.muted, fontSize: 13, marginTop: 2 },
  premiumBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: glass.borderSoft,
  },
  quotaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: spacing.sm,
    paddingHorizontal: 4,
  },
  quotaTrack: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    backgroundColor: "rgba(27,107,69,0.12)",
    overflow: "hidden",
  },
  quotaFill: { height: "100%", backgroundColor: colors.primary, borderRadius: 2 },
  quotaText: { fontSize: 11, fontWeight: "600", color: colors.primaryDark },
  list: { flex: 1 },
  messageList: { paddingHorizontal: spacing.lg, paddingTop: spacing.sm, paddingBottom: spacing.md },
  suggestions: { marginBottom: spacing.lg },
  suggestionsTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: colors.ink,
    marginBottom: spacing.sm,
  },
  chipGrid: { gap: 8 },
  chipPress: { width: "100%" },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  chipText: { flex: 1, color: colors.ink, fontSize: 13, fontWeight: "600" },
  messageRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 8,
    marginBottom: 12,
    maxWidth: "95%",
  },
  messageRowUser: { alignItems: "flex-end", marginBottom: 12 },
  botBadge: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.primaryLight,
    borderWidth: 1,
    borderColor: glass.borderSoft,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 2,
  },
  assistantPanel: { flex: 1 },
  assistantBubble: { paddingHorizontal: 14, paddingTop: 10, paddingBottom: 8 },
  assistantLabel: { fontSize: 11, fontWeight: "700", color: colors.primary, marginBottom: 4 },
  assistantBubbleText: { color: colors.ink, fontSize: 15, lineHeight: 22 },
  userBubble: {
    maxWidth: "82%",
    backgroundColor: colors.primary,
    borderRadius: 18,
    borderTopRightRadius: 4,
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 8,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  userBubbleText: { color: "#fff", fontSize: 15, lineHeight: 22 },
  bubbleTime: { alignSelf: "flex-end", fontSize: 10, color: colors.muted, marginTop: 6 },
  bubbleTimeUser: { alignSelf: "flex-end", fontSize: 10, color: "rgba(255,255,255,0.75)", marginTop: 6 },
  typingRow: { flexDirection: "row", alignItems: "flex-end", gap: 8, marginBottom: 12 },
  typingBubble: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  typingDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: colors.muted },
  gate: { marginTop: spacing.sm, marginBottom: spacing.md, alignItems: "center", gap: 8, padding: spacing.lg },
  gateIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },
  gateTitle: { fontWeight: "800", color: colors.ink, fontSize: 16 },
  gateText: { color: colors.muted, textAlign: "center", lineHeight: 20, fontSize: 13, marginBottom: 4 },
  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#FEE2E2",
    padding: 12,
    borderRadius: radius.md,
    marginBottom: spacing.sm,
  },
  errorText: { flex: 1, color: colors.error, fontSize: 13, fontWeight: "600" },
  compose: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 8,
    paddingHorizontal: spacing.lg,
    paddingTop: 8,
  },
  inputShell: { flex: 1 },
  inputWrap: {
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === "ios" ? 10 : 8,
    maxHeight: 120,
  },
  input: { fontSize: 15, color: colors.ink, maxHeight: 100, outlineStyle: "none" },
  sendBtn: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 2,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.25)",
  },
  sendBtnDisabled: { opacity: 0.4 },
  skeletonWrap: { padding: spacing.lg, gap: 16 },
  skeletonRow: { flexDirection: "row", alignItems: "flex-end", gap: 8 },
  skeletonRowUser: { justifyContent: "flex-end" },
});
