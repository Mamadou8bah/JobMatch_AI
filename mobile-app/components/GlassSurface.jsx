import { BlurView } from "expo-blur";
import { Platform, StyleSheet, View } from "react-native";
import { colors, radius } from "../constants/theme";

export default function GlassSurface({ children, style, intensity = 40 }) {
  if (Platform.OS === "web") {
    return <View style={[styles.fallback, style]}>{children}</View>;
  }

  return (
    <BlurView intensity={intensity} tint="light" style={[styles.blur, style]}>
      <View style={styles.overlay}>{children}</View>
    </BlurView>
  );
}

const styles = StyleSheet.create({
  blur: {
    overflow: "hidden",
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.glassBorder,
  },
  overlay: {
    backgroundColor: colors.glass,
  },
  fallback: {
    backgroundColor: colors.glass,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.glassBorder,
  },
});
