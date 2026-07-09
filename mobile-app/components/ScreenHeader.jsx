import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import BrandLogo from "./BrandLogo";
import GlassPanel from "./GlassPanel";
import { colors, radius } from "../constants/theme";

export default function ScreenHeader({ title, onBack, right, showLogo = true }) {
  return (
    <View style={styles.wrap}>
      {showLogo ? (
        <BrandLogo size="sm" iconOnly style={styles.logoMark} />
      ) : null}
      <View style={styles.row}>
        <Pressable onPress={onBack || (() => router.back())}>
          <GlassPanel borderRadius={radius.pill} noPadding contentStyle={styles.btn}>
            <Ionicons name="chevron-back" size={22} color={colors.ink} />
          </GlassPanel>
        </Pressable>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        <View style={styles.right}>{right || <View style={styles.btnPlaceholder} />}</View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: 16 },
  logoMark: { alignSelf: "center", marginBottom: 10 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  btn: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  btnPlaceholder: { width: 40, height: 40 },
  title: {
    flex: 1,
    textAlign: "center",
    fontSize: 17,
    fontWeight: "800",
    color: colors.ink,
    marginHorizontal: 8,
  },
  right: { minWidth: 40, alignItems: "flex-end" },
});
