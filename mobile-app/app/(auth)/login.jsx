import { router } from "expo-router";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AuthInput from "../../components/AuthInput";
import BrandLogo from "../../components/BrandLogo";
import PrimaryButton from "../../components/PrimaryButton";
import ScreenBackground from "../../components/ScreenBackground";
import { useAuth } from "../../context/AuthContext";
import { colors, spacing } from "../../constants/theme";

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    setLoading(true);
    setError("");
    try {
      const user = await login(email.trim(), password);
      if (!user.cvFileName) {
        router.replace("/(auth)/upload-resume");
      } else {
        router.replace("/(tabs)");
      }
    } catch (err) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenBackground>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView
          contentContainerStyle={{
            paddingTop: insets.top + spacing.lg,
            paddingHorizontal: spacing.lg,
            paddingBottom: insets.bottom + spacing.xl,
            flexGrow: 1,
            justifyContent: "center",
          }}
        >
          <View style={styles.header}>
            <BrandLogo size="xl" />
          </View>

          <Text style={styles.title}>Welcome back</Text>
          <Text style={styles.subtitle}>Sign in to continue your job search journey.</Text>

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <AuthInput
            label="Email Address"
            icon="email"
            placeholder="name@company.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <AuthInput
            label="Password"
            icon="lock"
            placeholder="Enter your password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <PrimaryButton title="Sign In" onPress={handleLogin} loading={loading} icon="arrow-forward" />

          <Pressable onPress={() => router.push("/(auth)/forgot-password")} style={styles.forgotLink}>
            <Text style={styles.forgotText}>Forgot password?</Text>
          </Pressable>

          <Pressable onPress={() => router.replace("/(auth)/register")} style={styles.footerLink}>
            <Text style={styles.footerText}>
              New here? <Text style={styles.footerAccent}>Create account</Text>
            </Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  header: { alignItems: "center", marginBottom: spacing.xl },
  title: { fontSize: 28, fontWeight: "900", color: colors.ink, marginBottom: 8 },
  subtitle: { color: colors.muted, marginBottom: spacing.lg, fontSize: 15 },
  error: { color: colors.error, marginBottom: spacing.md },
  forgotLink: { alignItems: "center", marginTop: spacing.md },
  forgotText: { color: colors.primary, fontWeight: "700" },
  footerLink: { marginTop: spacing.lg, alignItems: "center" },
  footerText: { color: colors.muted },
  footerAccent: { color: colors.primary, fontWeight: "700" },
});
