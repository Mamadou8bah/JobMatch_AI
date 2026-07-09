import { Image, StyleSheet, View } from "react-native";

const logo = require("../assets/jobmatch_logo.png");

/** Zoom past empty margin baked into the PNG (matches web BrandLogo). */
const LOGO_SCALE = 1.55;

const sizes = {
  sm: 36,
  md: 44,
  lg: 56,
  xl: 72,
};

export default function BrandLogo({
  size = "md",
  iconOnly = false,
  style,
}) {
  const icon = sizes[size] || sizes.md;

  return (
    <View style={[styles.wrap, iconOnly && styles.wrapIconOnly, style]}>
      <View style={[styles.iconWrap, { width: icon, height: icon, borderRadius: icon * 0.22 }]}>
        <Image
          source={logo}
          style={{
            width: icon,
            height: icon,
            transform: [{ scale: LOGO_SCALE }],
          }}
          resizeMode="contain"
          accessibilityLabel="JobMatch"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  wrapIconOnly: {
    justifyContent: "center",
  },
  iconWrap: {
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },
});
