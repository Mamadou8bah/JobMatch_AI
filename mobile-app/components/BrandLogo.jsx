import { Image, StyleSheet, View } from "react-native";

const logo = require("../assets/jobmatch_logo.png");

const sizes = {
  sm: 40,
  md: 52,
  lg: 64,
  xl: 72,
};

/** Zoom past the empty margin baked into the PNG asset. */
const LOGO_CROP_SCALE = 1.55;

export default function BrandLogo({ size = "md", style }) {
  const icon = sizes[size] || sizes.md;

  return (
    <View style={[styles.wrap, style]}>
      <View
        style={{
          width: icon,
          height: icon,
          borderRadius: icon * 0.22,
          overflow: "hidden",
        }}
      >
        <Image
          source={logo}
          style={{
            width: icon,
            height: icon,
            transform: [{ scale: LOGO_CROP_SCALE }],
          }}
          accessibilityLabel="JobMatch AI"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: "center",
    justifyContent: "center",
  },
});
