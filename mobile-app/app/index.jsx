import { Redirect } from "expo-router";
import { ActivityIndicator, StatusBar, StyleSheet, Text } from "react-native";
import BrandLogo from "../components/BrandLogo";
import ScreenBackground from "../components/ScreenBackground";
import { useAuth } from "../context/AuthContext";
import { colors, spacing } from "../constants/theme";

export default function Index() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <ScreenBackground style={styles.center}>
        <StatusBar barStyle="dark-content" />
        <BrandLogo size="xl" style={styles.logo} />
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading…</Text>
      </ScreenBackground>
    );
  }

  if (user) {
    if (!user.cvFileName) {
      return <Redirect href="/(auth)/upload-resume" />;
    }
    return <Redirect href="/(tabs)" />;
  }

  return <Redirect href="/(auth)/login" />;
}

const styles = StyleSheet.create({
  center: { alignItems: "center", justifyContent: "center" },
  logo: { marginBottom: spacing.md },
  loadingText: {
    marginTop: spacing.md,
    color: colors.ink,
    fontSize: 15,
    fontWeight: "600",
  },
});
