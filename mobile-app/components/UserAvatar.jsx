import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { colors } from "../constants/theme";

function initialsFromName(name = "User") {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default function UserAvatar({ user, size = 40, onPress, style }) {
  const radius = size / 2;
  const content = user?.avatarUrl ? (
    <Image
      source={{ uri: user.avatarUrl }}
      style={{ width: size, height: size, borderRadius: radius }}
      accessibilityLabel={`${user?.fullName || "User"} profile picture`}
    />
  ) : (
    <View style={[styles.fallback, { width: size, height: size, borderRadius: radius }]}>
      <Text style={[styles.fallbackText, { fontSize: size * 0.32 }]}>
        {initialsFromName(user?.fullName)}
      </Text>
    </View>
  );

  if (onPress) {
    return (
      <Pressable onPress={onPress} style={style}>
        {content}
      </Pressable>
    );
  }

  return <View style={style}>{content}</View>;
}

const styles = StyleSheet.create({
  fallback: {
    backgroundColor: colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },
  fallbackText: { color: colors.primaryDark, fontWeight: "800" },
});
