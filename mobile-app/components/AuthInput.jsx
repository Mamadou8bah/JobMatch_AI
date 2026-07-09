import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { colors, radius, spacing } from "../constants/theme";

const ICONS = {
  user: "person-outline",
  email: "mail-outline",
  lock: "lock-closed-outline",
};

export default function AuthInput({
  label,
  icon,
  value,
  onChangeText,
  placeholder,
  secureTextEntry,
  hint,
  keyboardType,
  autoCapitalize,
}) {
  const [hidden, setHidden] = useState(secureTextEntry);
  const [focused, setFocused] = useState(false);

  return (
    <View style={styles.wrap}>
      <View style={styles.labelRow}>
        <Text style={styles.label}>{label}</Text>
        {hint ? <Text style={styles.hint}>{hint}</Text> : null}
      </View>
      <View style={[styles.field, focused && styles.fieldFocused]}>
        {icon ? (
          <Ionicons
            name={ICONS[icon] || icon}
            size={18}
            color={focused ? colors.primary : colors.muted}
            style={styles.leading}
          />
        ) : null}
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.muted}
          secureTextEntry={hidden}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          underlineColorAndroid="transparent"
        />
        {secureTextEntry ? (
          <Pressable onPress={() => setHidden((v) => !v)} hitSlop={8}>
            <Ionicons name={hidden ? "eye-outline" : "eye-off-outline"} size={18} color={colors.muted} />
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: spacing.md },
  labelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  label: { fontSize: 14, fontWeight: "600", color: colors.ink },
  hint: { fontSize: 12, color: colors.muted },
  field: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: radius.lg,
    paddingHorizontal: 14,
    minHeight: 52,
  },
  fieldFocused: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  leading: { marginRight: 10 },
  input: {
    flex: 1,
    fontSize: 15,
    color: colors.ink,
    paddingVertical: 12,
    borderWidth: 0,
    outlineStyle: "none",
  },
});
