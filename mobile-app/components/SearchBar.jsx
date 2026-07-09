import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, TextInput, View } from "react-native";
import GlassPanel from "./GlassPanel";
import { colors, radius, spacing } from "../constants/theme";

export default function SearchBar({
  value,
  onChangeText,
  onSubmit,
  placeholder = "Search for your dream career",
}) {
  return (
    <View style={styles.row}>
      <GlassPanel borderRadius={radius.pill} style={styles.searchShell} contentStyle={styles.searchWrap}>
        <Ionicons name="search" size={18} color={colors.muted} />
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          onSubmitEditing={onSubmit}
          placeholder={placeholder}
          placeholderTextColor={colors.muted}
          returnKeyType="search"
        />
      </GlassPanel>
      <Pressable style={styles.searchBtn} onPress={onSubmit}>
        <Ionicons name="search" size={18} color="#fff" />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", gap: spacing.sm, alignItems: "center" },
  searchShell: { flex: 1 },
  searchWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: spacing.md,
    minHeight: 50,
  },
  input: { flex: 1, fontSize: 15, color: colors.ink, outlineStyle: "none" },
  searchBtn: {
    minWidth: 88,
    minHeight: 50,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 4,
  },
});
