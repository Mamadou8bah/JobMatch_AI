import { router } from "expo-router";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
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
import { api } from "../../services/api.js";
import { colors, spacing } from "../../constants/theme";

export default function ForgotPasswordScreen() {
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  const submit = async () => {
    setLoading(true);
    setError("");
    try {
      await api.auth.forgotPassword(email.trim());
      setSent(true);
    } catch (err) {
      setError(err.message || "Could not send reset email");
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

          <Text style={styles.title}>Reset password</Text>
          <Text style={styles.subtitle}>
            Enter your email and we&apos;ll send you instructions to reset your password.
          </Text>

          {error ? <Text style={styles.error}>{error}</Text> : null}
          {sent ? (
            <Text style={styles.success}>
              If an account exists for that email, reset instructions have been sent.
            </Text>
          ) : (
            <>
              <AuthInput
                label="Email Address"
                icon="email"
                placeholder="name@company.com"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              <PrimaryButton title="Send reset link" onPress={submit} loading={loading} />
            </>
          )}

          <PrimaryButton
            title="Back to sign in"
            onPress={() => router.replace("/(auth)/login")}
            variant="outline"
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  header: { alignItems: "center", marginBottom: spacing.xl },
  title: { fontSize: 28, fontWeight: "900", color: colors.ink, marginBottom: 8 },
  subtitle: { color: colors.muted, marginBottom: spacing.lg, lineHeight: 22 },
  error: { color: colors.error, marginBottom: spacing.md },
  success: { color: colors.primary, fontWeight: "600", marginBottom: spacing.lg, lineHeight: 22 },
});
