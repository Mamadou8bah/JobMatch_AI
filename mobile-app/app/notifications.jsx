import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import EmptyState from "../components/EmptyState";
import GlassPanel from "../components/GlassPanel";
import ScreenBackground from "../components/ScreenBackground";
import ScreenHeader from "../components/ScreenHeader";
import { SkeletonBox } from "../components/Skeleton";
import { api } from "../services/api.js";
import { colors, glass, radius, spacing } from "../constants/theme";

const TYPE_META = {
  chat: { icon: "chatbubble-outline", color: colors.primary, bg: colors.primaryLight },
  application: { icon: "briefcase-outline", color: "#2563EB", bg: "rgba(219,234,254,0.8)" },
  job: { icon: "megaphone-outline", color: "#7C3AED", bg: "rgba(237,233,254,0.8)" },
  system: { icon: "information-circle-outline", color: colors.muted, bg: "rgba(241,245,249,0.8)" },
};

function formatWhen(iso) {
  if (!iso) return "";
  const date = new Date(iso);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString([], { day: "numeric", month: "short" });
}

function metaFor(item) {
  const key = (item.type || "system").toLowerCase();
  return TYPE_META[key] || TYPE_META.system;
}

function NotificationSkeleton() {
  return (
    <View style={styles.skeletonRow}>
      <SkeletonBox width={44} height={44} borderRadius={14} />
      <View style={{ flex: 1, gap: 8 }}>
        <SkeletonBox width="60%" height={14} />
        <SkeletonBox width="90%" height={12} />
      </View>
    </View>
  );
}

export default function NotificationsScreen() {
  const insets = useSafeAreaInsets();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.notifications
      .mine()
      .then(setItems)
      .finally(() => setLoading(false));
  }, []);

  const markRead = async (id) => {
    await api.notifications.markRead(id);
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, read: true } : item)));
  };

  const markAllRead = async () => {
    const unread = items.filter((item) => !item.read);
    await Promise.all(unread.map((item) => api.notifications.markRead(item.id)));
    setItems((prev) => prev.map((item) => ({ ...item, read: true })));
  };

  const unreadCount = items.filter((item) => !item.read).length;

  return (
    <ScreenBackground>
      <FlatList
        data={loading ? [] : items}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{
          paddingTop: insets.top + spacing.md,
          paddingHorizontal: spacing.lg,
          paddingBottom: 40,
          flexGrow: 1,
        }}
        ListHeaderComponent={
          <View>
            <ScreenHeader
              title="Notifications"
              showLogo={false}
              right={
                unreadCount > 0 ? (
                  <Pressable onPress={markAllRead} style={styles.markAllBtn}>
                    <Text style={styles.markAll}>Mark all</Text>
                  </Pressable>
                ) : (
                  <View style={{ width: 64 }} />
                )
              }
            />

            {unreadCount > 0 ? (
              <GlassPanel borderRadius={radius.pill} style={styles.summaryShell} contentStyle={styles.summary}>
                <View style={styles.summaryDot} />
                <Text style={styles.summaryText}>
                  {unreadCount} unread notification{unreadCount === 1 ? "" : "s"}
                </Text>
              </GlassPanel>
            ) : null}

            {loading ? (
              <View style={styles.skeletonList}>
                {Array.from({ length: 5 }).map((_, i) => (
                  <NotificationSkeleton key={i} />
                ))}
              </View>
            ) : null}
          </View>
        }
        renderItem={({ item }) => {
          const meta = metaFor(item);

          return (
            <Pressable onPress={() => !item.read && markRead(item.id)}>
              <GlassPanel
                borderRadius={radius.lg}
                style={styles.cardShell}
                contentStyle={[styles.card, !item.read && styles.cardUnread]}
              >
                <View style={[styles.iconWrap, { backgroundColor: meta.bg }]}>
                  <Ionicons name={meta.icon} size={20} color={meta.color} />
                </View>
                <View style={styles.cardBody}>
                  <View style={styles.cardTop}>
                    <Text style={[styles.cardTitle, !item.read && styles.cardTitleUnread]} numberOfLines={1}>
                      {item.title}
                    </Text>
                    <Text style={styles.cardTime}>{formatWhen(item.createdAt)}</Text>
                  </View>
                  <Text style={styles.cardText} numberOfLines={3}>
                    {item.message}
                  </Text>
                  {!item.read ? (
                    <View style={styles.unreadPill}>
                      <Text style={styles.unreadPillText}>New</Text>
                    </View>
                  ) : null}
                </View>
              </GlassPanel>
            </Pressable>
          );
        }}
        ListEmptyComponent={
          !loading ? (
            <EmptyState
              icon="notifications-outline"
              title="All caught up"
              message="Application updates, messages, and job alerts will appear here."
            />
          ) : null
        }
      />
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  markAllBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  markAll: { color: colors.primary, fontWeight: "700", fontSize: 13 },
  summaryShell: { marginBottom: spacing.lg },
  summary: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  summaryDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
  },
  summaryText: { color: colors.primaryDark, fontWeight: "700", fontSize: 13 },
  skeletonList: { gap: 12, marginBottom: spacing.md },
  skeletonRow: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 4 },
  cardShell: { marginBottom: spacing.sm },
  card: {
    flexDirection: "row",
    gap: 12,
    padding: spacing.md,
  },
  cardUnread: {
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: glass.borderSoft,
  },
  cardBody: { flex: 1 },
  cardTop: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 8,
    marginBottom: 4,
  },
  cardTitle: { flex: 1, fontWeight: "600", color: colors.ink, fontSize: 15 },
  cardTitleUnread: { fontWeight: "800" },
  cardTime: { fontSize: 11, color: colors.muted, fontWeight: "600" },
  cardText: { color: colors.muted, lineHeight: 20, fontSize: 13 },
  unreadPill: {
    alignSelf: "flex-start",
    marginTop: 8,
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: glass.borderSoft,
  },
  unreadPillText: { fontSize: 10, fontWeight: "800", color: colors.primaryDark },
});
