import { Redirect } from "expo-router";
import { ActivityIndicator, StatusBar, StyleSheet, Text } from "react-native";
import { useAuth } from "../context/AuthContext";
import BrandLogo from "../components/BrandLogo";
import GlassBackground from "../components/GlassBackground";
import { colors } from "../constants/theme";

export default function Index() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <GlassBackground style={styles.center}>
        <StatusBar barStyle="dark-content" />
        <BrandLogo size="md" style={styles.logo} />
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading JobMatch AI…</Text>
      </GlassBackground>
    );
  }

  if (user) {
    return <Redirect href="/(tabs)" />;
  }

  return <Redirect href="/(auth)/login" />;
}

const styles = StyleSheet.create({
  center: { alignItems: "center", justifyContent: "center" },
  logo: { marginBottom: 16 },
  loadingText: {
    marginTop: 16,
    color: colors.ink,
    fontSize: 15,
    fontWeight: "600",
  },
});
