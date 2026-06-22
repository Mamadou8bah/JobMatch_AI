import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, TextInput, View } from "react-native";
import GlassSurface from "./GlassSurface";
import { colors, radius, spacing } from "../constants/theme";

export default function SearchBar({ value, onChangeText, onSubmit, placeholder = "Search..." }) {
  return (
    <View style={styles.row}>
      <GlassSurface style={styles.searchWrap} intensity={50}>
        <View style={styles.searchInner}>
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
        </View>
      </GlassSurface>
      <Pressable style={styles.filterBtn} onPress={onSubmit}>
        <Ionicons name="options-outline" size={20} color={colors.ink} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", gap: spacing.sm, alignItems: "center" },
  searchWrap: { flex: 1 },
  searchInner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: spacing.md,
    paddingVertical: 14,
  },
  input: { flex: 1, fontSize: 15, color: colors.ink },
  filterBtn: {
    width: 48,
    height: 48,
    borderRadius: radius.pill,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
  },
});
