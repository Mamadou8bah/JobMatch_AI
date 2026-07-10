import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors, glass, radius, shadow } from "../constants/theme";

const TABS = [
  { name: "index", icon: "home-outline", iconFocused: "home", label: "Home" },
  { name: "messages", icon: "chatbubble-outline", iconFocused: "chatbubble", label: "Messages" },
  { name: "coach", icon: "sparkles-outline", iconFocused: "sparkles", label: "Coach" },
  { name: "explore", icon: "compass-outline", iconFocused: "compass", label: "Explore" },
];

export default function StitchTabBar({ state, navigation }) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.wrap, { paddingBottom: Math.max(insets.bottom, 14) }]} pointerEvents="box-none">
      <View style={[styles.barShell, shadow.soft]}>
        <BlurView
          intensity={Platform.OS === "android" ? 72 : 64}
          tint="light"
          style={[StyleSheet.absoluteFillObject, styles.barBlur]}
        />
        <View style={styles.barTint} />
        <View style={styles.barEdge} />
        <View style={styles.bar}>
          {state.routes
            .filter((route) => TABS.some((tab) => tab.name === route.name))
            .map((route) => {
              const focused = state.routes[state.index]?.name === route.name;
              const tab = TABS.find((t) => t.name === route.name);

              return (
                <Pressable
                  key={route.key}
                  style={[styles.tab, focused && styles.tabActive]}
                  onPress={() => navigation.navigate(route.name)}
                  accessibilityRole="button"
                  accessibilityLabel={tab.label}
                  accessibilityState={{ selected: focused }}
                >
                  {focused ? (
                    <>
                      <Ionicons name={tab.iconFocused} size={20} color="#fff" />
                      <Text style={styles.activeLabel}>{tab.label}</Text>
                    </>
                  ) : (
                    <View style={styles.inactiveIconWrap}>
                      <Ionicons name={tab.icon} size={24} color={colors.ink} />
                    </View>
                  )}
                </Pressable>
              );
            })}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    paddingHorizontal: 20,
  },
  barShell: {
    width: "100%",
    maxWidth: 380,
    borderRadius: radius.pill,
    overflow: "hidden",
  },
  barBlur: {
    borderRadius: radius.pill,
  },
  barTint: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: glass.tintStrong,
    borderRadius: radius.pill,
  },
  barEdge: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: glass.borderSoft,
    borderTopColor: glass.highlight,
  },
  bar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
    paddingHorizontal: 10,
    position: "relative",
    zIndex: 2,
  },
  tab: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: 52,
    paddingHorizontal: 4,
  },
  tabActive: {
    flexDirection: "row",
    gap: 8,
    backgroundColor: glass.activeTab,
    borderRadius: radius.pill,
    paddingHorizontal: 18,
    paddingVertical: 13,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.35)",
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 4,
  },
  activeLabel: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
  },
  inactiveIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(255,255,255,0.5)",
    borderWidth: 1,
    borderColor: glass.borderSoft,
    alignItems: "center",
    justifyContent: "center",
  },
});
