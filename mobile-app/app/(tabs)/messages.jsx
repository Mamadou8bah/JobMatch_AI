import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import GlassPanel from "../../components/GlassPanel";
import EmptyState from "../../components/EmptyState";
import ScreenBackground from "../../components/ScreenBackground";
import CompanyLogo from "../../components/CompanyLogo";
import { ThreadRowSkeleton } from "../../components/Skeleton";
import UserAvatar from "../../components/UserAvatar";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../services/api.js";
import { colors, glass, radius, spacing } from "../../constants/theme";

function formatThreadTime(iso) {
  if (!iso) return "";
  const date = new Date(iso);
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();
  if (isToday) return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
  if (diffDays < 7) return date.toLocaleDateString([], { weekday: "short" });
  return date.toLocaleDateString([], { day: "numeric", month: "short" });
}

function peerFromThread(thread, userId) {
  return thread.employer?.id === userId ? thread.applicant : thread.employer;
}

function peerLabel(thread, userId) {
  const peer = peerFromThread(thread, userId);
  if (!peer) return "Chat";
  return peer.companyName || peer.fullName || "Employer";
}

function isEmployerPeer(thread, userId) {
  const peer = peerFromThread(thread, userId);
  return thread.employer?.id === peer?.id;
}

function employerLogoProps(thread) {
  const employer = thread.employer;
  return {
    name: employer?.companyName || employer?.fullName || "Company",
    avatarUrl: employer?.avatarUrl,
    employerId: employer?.id,
  };
}

function lastPreview(thread) {
  const msg = thread.messages?.[0];
  if (!msg?.content) return "Tap to start chatting";
  const prefix = msg.sender?.fullName ? `${msg.sender.fullName.split(" ")[0]}: ` : "";
  return `${prefix}${msg.content}`;
}

function isUnread(thread, userId) {
  const msg = thread.messages?.[0];
  if (!msg || msg.sender?.id === userId) return false;
  return !(msg.reads || []).some((read) => read.userId === userId);
}

export default function MessagesScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [threads, setThreads] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const loadThreads = useCallback(async () => {
    try {
      const data = await api.chat.listThreads();
      setThreads(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadThreads();
    }, [loadThreads])
  );

  const filtered = threads.filter((thread) => {
    const label = peerLabel(thread, user?.id).toLowerCase();
    const job = (thread.job?.title || "").toLowerCase();
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return label.includes(q) || job.includes(q);
  });

  const openThread = (threadId) => {
    router.push(`/chat/${threadId}`);
  };

  return (
    <ScreenBackground>
    <View style={styles.screen}>
      <View style={[styles.header, { paddingTop: insets.top + spacing.md }]}>
        <Text style={styles.title}>Messages</Text>
        <GlassPanel borderRadius={radius.pill} contentStyle={styles.searchWrap}>
          <Ionicons name="search" size={18} color={colors.muted} />
          <TextInput
            style={styles.searchInput}
            value={search}
            onChangeText={setSearch}
            placeholder="Search conversations"
            placeholderTextColor={colors.muted}
          />
        </GlassPanel>
      </View>

      {loading ? (
        <View>
          {Array.from({ length: 6 }).map((_, i) => (
            <ThreadRowSkeleton key={i} />
          ))}
        </View>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon="chatbubbles-outline"
          title={search ? "No matches" : "No conversations yet"}
          message={
            search
              ? "Try another name or job title."
              : "Message an employer from a job details page to start chatting."
          }
        />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: 110 }}
          renderItem={({ item }) => {
            const peer = peerFromThread(item, user?.id);
            const unread = isUnread(item, user?.id);

            return (
              <Pressable style={styles.row} onPress={() => openThread(item.id)}>
                {isEmployerPeer(item, user?.id) ? (
                  <CompanyLogo
                    {...employerLogoProps(item)}
                    size={52}
                    rounded="circle"
                  />
                ) : (
                  <UserAvatar user={peer} size={52} />
                )}
                <View style={styles.rowBody}>
                  <View style={styles.rowTop}>
                    <Text style={[styles.name, unread && styles.nameUnread]} numberOfLines={1}>
                      {peerLabel(item, user?.id)}
                    </Text>
                    <Text style={[styles.time, unread && styles.timeUnread]}>
                      {formatThreadTime(item.lastMessageAt || item.updatedAt)}
                    </Text>
                  </View>
                  {item.job?.title ? (
                    <Text style={styles.jobTitle} numberOfLines={1}>
                      {item.job.title}
                    </Text>
                  ) : null}
                  <View style={styles.previewRow}>
                    <Text
                      style={[styles.preview, unread && styles.previewUnread]}
                      numberOfLines={1}
                    >
                      {lastPreview(item)}
                    </Text>
                    {unread ? <View style={styles.unreadDot} /> : null}
                  </View>
                </View>
              </Pressable>
            );
          }}
        />
      )}
    </View>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "transparent" },
  header: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: glass.borderSoft,
  },
  title: { fontSize: 28, fontWeight: "800", color: colors.ink, marginBottom: spacing.md },
  searchWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  searchInput: { flex: 1, fontSize: 15, color: colors.ink, outlineStyle: "none" },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  rowBody: { flex: 1 },
  rowTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8 },
  name: { flex: 1, fontSize: 16, fontWeight: "600", color: colors.ink },
  nameUnread: { fontWeight: "800" },
  time: { fontSize: 12, color: colors.muted },
  timeUnread: { color: colors.primary, fontWeight: "700" },
  jobTitle: { fontSize: 12, color: colors.primary, fontWeight: "600", marginTop: 2 },
  previewRow: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 4 },
  preview: { flex: 1, fontSize: 14, color: colors.muted },
  previewUnread: { color: colors.ink, fontWeight: "600" },
  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary,
  },
});
