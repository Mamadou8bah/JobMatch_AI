import { BlurView } from "expo-blur";
import { Platform, StyleSheet, View } from "react-native";
import { glass, radius as themeRadius } from "../constants/theme";

export default function GlassPanel({
  children,
  style,
  contentStyle,
  intensity = 52,
  borderRadius = themeRadius.lg,
  variant = "light",
  noPadding = false,
}) {
  const isDark = variant === "dark";
  const blurTint = isDark ? "dark" : "light";

  return (
    <View style={[styles.shell, { borderRadius }, shadowStyle, style]}>
      <BlurView
        intensity={Platform.OS === "android" ? intensity + 10 : intensity}
        tint={blurTint}
        style={[StyleSheet.absoluteFillObject, { borderRadius, overflow: "hidden" }]}
      />
      <View
        style={[
          styles.tint,
          { borderRadius },
          isDark ? styles.tintDark : styles.tintLight,
        ]}
      />
      <View
        style={[
          styles.edge,
          { borderRadius },
          isDark ? styles.edgeDark : styles.edgeLight,
        ]}
      />
      <View style={[noPadding ? null : styles.content, contentStyle]}>{children}</View>
    </View>
  );
}

const shadowStyle = {
  shadowColor: glass.shadow,
  shadowOffset: { width: 0, height: 10 },
  shadowOpacity: 0.28,
  shadowRadius: 22,
  elevation: 7,
};

const styles = StyleSheet.create({
  shell: {
    overflow: "hidden",
    backgroundColor: "transparent",
  },
  tint: {
    ...StyleSheet.absoluteFillObject,
  },
  tintLight: {
    backgroundColor: glass.tint,
  },
  tintDark: {
    backgroundColor: glass.tintDark,
  },
  edge: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: 1,
  },
  edgeLight: {
    borderColor: glass.borderSoft,
    borderTopColor: glass.highlight,
    borderLeftColor: glass.border,
  },
  edgeDark: {
    borderColor: "rgba(255,255,255,0.12)",
    borderTopColor: "rgba(255,255,255,0.28)",
  },
  content: {
    position: "relative",
    zIndex: 2,
  },
});
