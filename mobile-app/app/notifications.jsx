import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import GlassBackground from "../components/GlassBackground";
import { api } from "../services/api.js";
import { colors, radius, spacing } from "../constants/theme";

export default function NotificationsScreen() {
  const insets = useSafeAreaInsets();
  const [items, setItems] = useState([]);

  useEffect(() => {
    api.notifications.mine().then(setItems);
  }, []);

  const markRead = async (id) => {
    await api.notifications.markRead(id);
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, read: true } : item)));
  };

  return (
    <GlassBackground>
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{
          paddingTop: insets.top + spacing.md,
          paddingHorizontal: spacing.lg,
          paddingBottom: 40,
        }}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.title}>Notifications</Text>
            <Pressable onPress={() => router.back()}>
              <Ionicons name="close" size={24} color={colors.ink} />
            </Pressable>
          </View>
        }
        renderItem={({ item }) => (
          <View style={[styles.card, !item.read && styles.unread]}>
            <Text style={styles.cardTitle}>{item.title}</Text>
            <Text style={styles.cardText}>{item.message}</Text>
            {!item.read && (
              <Pressable onPress={() => markRead(item.id)}>
                <Text style={styles.markRead}>Mark as read</Text>
              </Pressable>
            )}
          </View>
        )}
      />
    </GlassBackground>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.lg,
  },
  title: { fontSize: 24, fontWeight: "800", color: colors.ink },
  card: {
    backgroundColor: "#fff",
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.sm,
  },
  unread: { borderWidth: 1, borderColor: colors.primary },
  cardTitle: { fontWeight: "700", color: colors.ink },
  cardText: { color: colors.muted, marginTop: 4 },
  markRead: { color: colors.primary, marginTop: spacing.sm, fontWeight: "600" },
});
