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

export default function RegisterScreen() {
  const insets = useSafeAreaInsets();
  const { register } = useAuth();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRegister = async () => {
    setLoading(true);
    setError("");
    try {
      await register({ fullName, email: email.trim(), password });
      router.replace("/(auth)/upload-resume");
    } catch (err) {
      setError(err.message || "Registration failed");
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
          }}
        >
          <View style={styles.header}>
            <BrandLogo size="xl" />
          </View>

          <Text style={styles.title}>Create your account</Text>
          <Text style={styles.subtitle}>Step into a personalized career experience.</Text>

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <AuthInput
            label="Full Name"
            icon="user"
            placeholder="Enter your full name"
            value={fullName}
            onChangeText={setFullName}
          />
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
            placeholder="Create a strong password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            hint="At least 8 characters"
          />

          <PrimaryButton title="Sign Up" onPress={handleRegister} loading={loading} icon="arrow-forward" />

          <Pressable onPress={() => router.replace("/(auth)/login")} style={styles.footerLink}>
            <Text style={styles.footerText}>
              Already have an account? <Text style={styles.footerAccent}>Log in</Text>
            </Text>
          </Pressable>

          <View style={styles.legalRow}>
            <Text style={styles.legal}>Privacy Policy</Text>
            <Text style={styles.legal}>Terms of Service</Text>
            <Text style={styles.legal}>Cookie Settings</Text>
          </View>
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
  footerLink: { marginTop: spacing.lg, alignItems: "center" },
  footerText: { color: colors.muted },
  footerAccent: { color: colors.primary, fontWeight: "700" },
  legalRow: {
    flexDirection: "row",
    justifyContent: "center",
    flexWrap: "wrap",
    gap: 12,
    marginTop: spacing.lg,
  },
  legal: { fontSize: 12, color: colors.muted },
});
