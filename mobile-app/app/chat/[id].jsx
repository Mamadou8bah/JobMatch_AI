import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
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
import UserAvatar from "../../components/UserAvatar";
import CompanyLogo from "../../components/CompanyLogo";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../services/api.js";
import { colors, radius, spacing } from "../../constants/theme";

function formatTime(iso) {
  if (!iso) return "";
  const date = new Date(iso);
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function formatDateLabel(iso) {
  if (!iso) return "";
  const date = new Date(iso);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  if (date.toDateString() === today.toDateString()) return "Today";
  if (date.toDateString() === yesterday.toDateString()) return "Yesterday";
  return date.toLocaleDateString([], { day: "numeric", month: "short", year: "numeric" });
}

function peerFromThread(thread, userId) {
  if (!thread) return null;
  return thread.employer?.id === userId ? thread.applicant : thread.employer;
}

function peerName(thread, userId) {
  const peer = peerFromThread(thread, userId);
  if (!peer) return "Chat";
  return peer.companyName || peer.fullName || "Employer";
}

export default function ChatScreen() {
  const { id } = useLocalSearchParams();
  const threadId = Array.isArray(id) ? id[0] : id;
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const listRef = useRef(null);

  const [thread, setThread] = useState(null);
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const load = useCallback(async () => {
    if (!threadId) return;
    try {
      const [threads, msgs] = await Promise.all([
        api.chat.listThreads(),
        api.chat.listMessages(threadId),
      ]);
      setThread(threads.find((t) => t.id === threadId) || null);
      setMessages(msgs);
      api.chat.markRead(threadId).catch(() => {});
    } finally {
      setLoading(false);
    }
  }, [threadId]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (messages.length) {
      setTimeout(() => listRef.current?.scrollToEnd({ animated: false }), 50);
    }
  }, [messages.length, loading]);

  const send = async () => {
    if (!draft.trim() || !threadId || sending) return;
    const content = draft.trim();
    setDraft("");
    setSending(true);
    try {
      const message = await api.chat.sendMessage(threadId, content);
      setMessages((prev) => [...prev, message]);
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 80);
    } catch {
      setDraft(content);
    } finally {
      setSending(false);
    }
  };

  const peer = peerFromThread(thread, user?.id);
  const title = peerName(thread, user?.id);
  const subtitle = thread?.job?.title ? `Re: ${thread.job.title}` : "Application chat";
  const showCompanyLogo = Boolean(thread?.employer?.id && peer?.id && thread.employer.id === peer.id);

  const renderMessage = ({ item, index }) => {
    const mine = item.sender?.id === user?.id;
    const prev = messages[index - 1];
    const showDate =
      !prev || formatDateLabel(prev.createdAt) !== formatDateLabel(item.createdAt);

    return (
      <View>
        {showDate ? (
          <View style={styles.datePill}>
            <Text style={styles.dateText}>{formatDateLabel(item.createdAt)}</Text>
          </View>
        ) : null}
        <View style={[styles.bubbleRow, mine && styles.bubbleRowMine]}>
          <View style={[styles.bubble, mine ? styles.bubbleOut : styles.bubbleIn]}>
            <Text style={[styles.bubbleText, mine && styles.bubbleTextOut]}>{item.content}</Text>
            <Text style={[styles.time, mine && styles.timeOut]}>{formatTime(item.createdAt)}</Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.screen}>
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <Pressable style={styles.headerBtn} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color="#fff" />
        </Pressable>
        {showCompanyLogo ? (
          <CompanyLogo
            name={thread.employer.companyName || thread.employer.fullName || title}
            avatarUrl={thread.employer.avatarUrl}
            employerId={thread.employer.id}
            size={40}
            rounded="circle"
          />
        ) : (
          <UserAvatar user={peer} size={40} />
        )}
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {title}
          </Text>
          <Text style={styles.headerSub} numberOfLines={1}>
            {subtitle}
          </Text>
        </View>
        <Pressable style={styles.headerBtn}>
          <Ionicons name="ellipsis-vertical" size={20} color="#fff" />
        </Pressable>
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={0}
      >
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessage}
          contentContainerStyle={[
            styles.messageList,
            { paddingBottom: spacing.md },
            !messages.length && styles.messageListEmpty,
          ]}
          ListEmptyComponent={
            !loading ? (
              <View style={styles.emptyChat}>
                <Ionicons name="chatbubble-ellipses-outline" size={48} color={colors.muted} />
                <Text style={styles.emptyTitle}>No messages yet</Text>
                <Text style={styles.emptyHint}>Say hello to start the conversation.</Text>
              </View>
            ) : null
          }
          onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: false })}
        />

        <View style={[styles.compose, { paddingBottom: Math.max(insets.bottom, 10) }]}>
          <View style={styles.inputWrap}>
            <TextInput
              style={styles.input}
              value={draft}
              onChangeText={setDraft}
              placeholder="Message"
              placeholderTextColor={colors.muted}
              multiline
              maxLength={2000}
            />
          </View>
          <Pressable
            style={[styles.sendBtn, (!draft.trim() || sending) && styles.sendBtnDisabled]}
            onPress={send}
            disabled={!draft.trim() || sending}
          >
            <Ionicons name="send" size={18} color="#fff" />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.chatBg },
  flex: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: colors.chatHeader,
    paddingHorizontal: spacing.sm,
    paddingBottom: 12,
  },
  headerBtn: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  headerInfo: { flex: 1 },
  headerTitle: { color: "#fff", fontSize: 17, fontWeight: "700" },
  headerSub: { color: "rgba(255,255,255,0.8)", fontSize: 12, marginTop: 2 },
  messageList: { paddingHorizontal: spacing.md, paddingTop: spacing.md, flexGrow: 1 },
  messageListEmpty: { flex: 1, justifyContent: "center" },
  datePill: {
    alignSelf: "center",
    backgroundColor: "rgba(255,255,255,0.9)",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: radius.pill,
    marginBottom: spacing.md,
  },
  dateText: { fontSize: 12, color: colors.muted, fontWeight: "600" },
  bubbleRow: { flexDirection: "row", marginBottom: 6 },
  bubbleRowMine: { justifyContent: "flex-end" },
  bubble: {
    maxWidth: "78%",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
    elevation: 1,
  },
  bubbleIn: {
    backgroundColor: colors.chatBubbleIn,
    borderTopLeftRadius: 4,
  },
  bubbleOut: {
    backgroundColor: colors.chatBubbleOut,
    borderTopRightRadius: 4,
  },
  bubbleText: { color: colors.ink, fontSize: 15, lineHeight: 21 },
  bubbleTextOut: { color: colors.ink },
  time: {
    alignSelf: "flex-end",
    fontSize: 10,
    color: colors.muted,
    marginTop: 4,
  },
  timeOut: { color: "rgba(0,0,0,0.45)" },
  compose: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 8,
    paddingHorizontal: spacing.sm,
    paddingTop: 8,
    backgroundColor: "#F0F2F1",
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  inputWrap: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 24,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === "ios" ? 10 : 6,
    maxHeight: 120,
    borderWidth: 1,
    borderColor: colors.border,
  },
  input: {
    fontSize: 15,
    color: colors.ink,
    maxHeight: 100,
    outlineStyle: "none",
  },
  sendBtn: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: colors.chatHeader,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 2,
  },
  sendBtnDisabled: { opacity: 0.45 },
  emptyChat: { alignItems: "center", paddingHorizontal: spacing.xl },
  emptyTitle: { fontSize: 18, fontWeight: "700", color: colors.ink, marginTop: spacing.md },
  emptyHint: { color: colors.muted, textAlign: "center", marginTop: 6, lineHeight: 20 },
});
