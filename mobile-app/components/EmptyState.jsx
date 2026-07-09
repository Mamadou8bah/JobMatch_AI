import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";
import PrimaryButton from "./PrimaryButton";
import { colors, spacing } from "../constants/theme";

export default function EmptyState({ icon = "file-tray-outline", title, message, actionLabel, onAction }) {
  return (
    <View style={styles.wrap}>
      <View style={styles.iconWrap}>
        <Ionicons name={icon} size={28} color={colors.primary} />
      </View>
      <Text style={styles.title}>{title}</Text>
      {message ? <Text style={styles.message}>{message}</Text> : null}
      {actionLabel && onAction ? (
        <PrimaryButton title={actionLabel} onPress={onAction} variant="outline" />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: "center",
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
    gap: 12,
  },
  iconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  title: { fontSize: 18, fontWeight: "800", color: colors.ink, textAlign: "center" },
  message: { color: colors.muted, textAlign: "center", lineHeight: 22, marginBottom: 8 },
});
