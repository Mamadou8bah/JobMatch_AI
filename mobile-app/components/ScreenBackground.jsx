import { LinearGradient } from "expo-linear-gradient";
import { StyleSheet, View } from "react-native";
import { colors } from "../constants/theme";

export default function ScreenBackground({ children, style }) {
  return (
    <View style={[styles.root, style]}>
      <LinearGradient
        colors={["#FAFCFB", "#F4F8F6", "#EEF4F0"]}
        locations={[0, 0.55, 1]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />
      <View style={[styles.glow, styles.glowTop]} />
      <View style={[styles.glow, styles.glowBottom]} />
      <View style={styles.content}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
  },
  glow: {
    position: "absolute",
    borderRadius: 999,
  },
  glowTop: {
    width: 320,
    height: 320,
    top: -120,
    right: -80,
    backgroundColor: "rgba(82, 183, 136, 0.12)",
  },
  glowBottom: {
    width: 280,
    height: 280,
    bottom: -100,
    left: -60,
    backgroundColor: "rgba(27, 107, 69, 0.08)",
  },
});
