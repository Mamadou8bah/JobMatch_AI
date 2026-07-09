import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import PrimaryButton from "./PrimaryButton";
import { colors, radius, spacing } from "../constants/theme";

export default function ConfirmModal({
  visible,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  destructive,
  onConfirm,
  onCancel,
}) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.title}>{title}</Text>
          {message ? <Text style={styles.message}>{message}</Text> : null}
          <View style={styles.actions}>
            <PrimaryButton title={cancelLabel} onPress={onCancel} variant="outline" />
            <PrimaryButton
              title={confirmLabel}
              onPress={onConfirm}
              variant={destructive ? "danger" : "primary"}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.lg,
  },
  card: {
    width: "100%",
    maxWidth: 360,
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.lg,
    gap: 12,
  },
  title: { fontSize: 20, fontWeight: "800", color: colors.ink },
  message: { color: colors.muted, lineHeight: 22 },
  actions: { gap: 10, marginTop: 4 },
});
