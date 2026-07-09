import { Ionicons } from "@expo/vector-icons";
import { ActivityIndicator, Pressable, StyleSheet, Text } from "react-native";
import { colors, radius } from "../constants/theme";

export default function PrimaryButton({
  title,
  onPress,
  loading,
  disabled,
  variant = "primary",
  icon,
}) {
  const isDark = variant === "dark";
  const isOutline = variant === "outline";
  const isDanger = variant === "danger";

  return (
    <Pressable
      style={[
        styles.btn,
        isDark && styles.dark,
        isOutline && styles.outline,
        isDanger && styles.danger,
        (disabled || loading) && styles.disabled,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
    >
      {loading ? (
        <ActivityIndicator color={isOutline ? colors.ink : "#fff"} />
      ) : (
        <>
          <Text style={[styles.text, isOutline && styles.outlineText]}>{title}</Text>
          {icon ? <Ionicons name={icon} size={18} color={isOutline ? colors.ink : "#fff"} /> : null}
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    minHeight: 54,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingHorizontal: 20,
  },
  dark: {
    backgroundColor: colors.black,
  },
  outline: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.ink,
  },
  danger: {
    backgroundColor: colors.error,
  },
  disabled: { opacity: 0.55 },
  text: { color: "#fff", fontSize: 16, fontWeight: "700" },
  outlineText: { color: colors.ink },
});
