import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Pressable, StyleSheet, View } from "react-native";
import { useAuth } from "../context/AuthContext";
import BrandLogo from "./BrandLogo";
import GlassPanel from "./GlassPanel";
import UserAvatar from "./UserAvatar";
import { colors, glass, radius } from "../constants/theme";

export default function AppHeader({ onNotifications, showAvatar = true, onAvatarPress }) {
  const { user } = useAuth();

  const handleAvatarPress = onAvatarPress ?? (() => router.push("/profile"));

  return (
    <View style={styles.row}>
      {showAvatar ? (
        <View style={styles.avatarRing}>
          <UserAvatar user={user} size={40} onPress={handleAvatarPress} />
        </View>
      ) : (
        <View style={styles.spacer} />
      )}

      <BrandLogo size="lg" />

      <Pressable onPress={onNotifications}>
        <GlassPanel borderRadius={radius.pill} noPadding contentStyle={styles.bell}>
          <Ionicons name="notifications-outline" size={22} color={colors.ink} />
          <View style={styles.dot} />
        </GlassPanel>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  spacer: { width: 40 },
  avatarRing: {
    borderRadius: 22,
    borderWidth: 2,
    borderColor: glass.border,
    padding: 1,
  },
  bell: {
    width: 40,
    height: 40,
    borderRadius: radius.pill,
    alignItems: "center",
    justifyContent: "center",
  },
  dot: {
    position: "absolute",
    top: 9,
    right: 10,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.notification,
    borderWidth: 1.5,
    borderColor: colors.white,
  },
});
