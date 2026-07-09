import { StyleSheet, Text, View } from "react-native";
import { colors, radius } from "../constants/theme";

const STATUS_COLORS = {
  pending: { bg: "#FEF3C7", text: "#92400E" },
  shortlisted: { bg: colors.primaryLight, text: colors.primaryDark },
  interview: { bg: "#DBEAFE", text: "#1D4ED8" },
  hired: { bg: "#DCFCE7", text: "#166534" },
  rejected: { bg: "#FEE2E2", text: "#B91C1C" },
};

export default function StatusBadge({ status }) {
  const key = (status || "pending").toLowerCase();
  const palette = STATUS_COLORS[key] || STATUS_COLORS.pending;

  return (
    <View style={[styles.badge, { backgroundColor: palette.bg }]}>
      <Text style={[styles.text, { color: palette.text }]}>
        {(status || "pending").replace(/_/g, " ")}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.pill,
    alignSelf: "flex-start",
  },
  text: {
    fontSize: 12,
    fontWeight: "700",
    textTransform: "capitalize",
  },
});
