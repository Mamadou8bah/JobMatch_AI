import { Redirect } from "expo-router";
import { ActivityIndicator, StatusBar, StyleSheet, Text } from "react-native";
import BrandLogo from "../components/BrandLogo";
import ScreenBackground from "../components/ScreenBackground";
import { useAuth } from "../context/AuthContext";
import { getItem, KEYS } from "../services/storage";
import { colors, spacing } from "../constants/theme";
import { useEffect, useState } from "react";

export default function Index() {
  const { user, loading } = useAuth();
  const [onboardingDone, setOnboardingDone] = useState(null);

  useEffect(() => {
    getItem(KEYS.onboardingComplete).then((value) => setOnboardingDone(!!value));
  }, []);

  if (loading || onboardingDone === null) {
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

  if (!onboardingDone) {
    return <Redirect href="/(auth)/onboarding" />;
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
