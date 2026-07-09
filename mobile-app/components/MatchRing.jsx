import { StyleSheet, Text, View } from "react-native";
import { colors } from "../constants/theme";

export default function MatchRing({ score = 0, size = 58, label = "MATCH", band }) {
  const hasScore = score != null && !Number.isNaN(Number(score));
  const value = hasScore ? Math.round(Math.min(100, Math.max(0, Number(score)))) : 0;
  const display = hasScore ? `${value}%` : (band || "—").toString().slice(0, 6).toUpperCase();
  const ring = size;
  const inner = size - 10;
  const strength = hasScore ? value : band === "strong" ? 90 : band === "good" ? 70 : 40;

  return (
    <View style={[styles.wrap, { width: ring, height: ring }]}>
      <View
        style={[
          styles.ring,
          {
            width: ring,
            height: ring,
            borderRadius: ring / 2,
            borderColor: strength >= 75 ? colors.primary : colors.border,
            borderTopColor: colors.primary,
            borderRightColor: strength >= 50 ? colors.primary : colors.border,
            borderBottomColor: strength >= 25 ? colors.primary : colors.border,
          },
        ]}
      />
      <View
        style={[
          styles.inner,
          {
            width: inner,
            height: inner,
            borderRadius: inner / 2,
          },
        ]}
      >
        <Text style={[styles.score, !hasScore && styles.bandScore]}>{display}</Text>
        <Text style={styles.label}>{label}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: "center",
    justifyContent: "center",
  },
  ring: {
    position: "absolute",
    borderWidth: 3,
  },
  inner: {
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  score: {
    fontSize: 13,
    fontWeight: "800",
    color: colors.ink,
    lineHeight: 16,
  },
  bandScore: { fontSize: 10 },
  label: {
    fontSize: 8,
    fontWeight: "700",
    color: colors.muted,
    letterSpacing: 0.5,
  },
});
