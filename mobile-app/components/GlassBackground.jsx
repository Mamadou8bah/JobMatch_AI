import { LinearGradient } from "expo-linear-gradient";
import { StyleSheet, View } from "react-native";
import { colors } from "../constants/theme";

export default function GlassBackground({ children, style }) {
  return (
    <LinearGradient
      colors={[colors.gradientStart, colors.gradientMid, colors.gradientEnd]}
      style={[styles.gradient, style]}
    >
      <View style={styles.blobTop} />
      <View style={styles.blobBottom} />
      {children}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  blobTop: {
    position: "absolute",
    top: -80,
    right: -40,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: "rgba(255,255,255,0.25)",
  },
  blobBottom: {
    position: "absolute",
    bottom: 120,
    left: -60,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: "rgba(59,130,246,0.12)",
  },
});
