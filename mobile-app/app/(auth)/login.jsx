import { Ionicons } from "@expo/vector-icons";
import { Link, router } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import GlassBackground from "../../components/GlassBackground";
import GlassSurface from "../../components/GlassSurface";
import BrandLogo from "../../components/BrandLogo";
import { useAuth } from "../../context/AuthContext";
import { DEMO_ACCOUNT, DEMO_PASSWORD } from "../../services/demoSession";
import { colors, radius, spacing } from "../../constants/theme";

export default function LoginScreen() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    setLoading(true);
    setError("");
    try {
      await login(email.trim(), password);
      router.replace("/(tabs)");
    } catch (err) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <GlassBackground>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView contentContainerStyle={styles.container}>
          <View style={styles.hero}>
            <BrandLogo size="md" style={styles.brandRow} />
            <Text style={styles.subtitle}>Job seeker mobile app</Text>
          </View>

          <GlassSurface style={styles.formCard}>
            <View style={styles.formInner}>
              <Text style={styles.title}>Welcome back</Text>
              <Text style={styles.text}>Sign in to discover new job matches</Text>

              {error ? <Text style={styles.error}>{error}</Text> : null}

              <TextInput
                style={styles.input}
                placeholder="Email"
                placeholderTextColor={colors.muted}
                autoCapitalize="none"
                keyboardType="email-address"
                value={email}
                onChangeText={setEmail}
              />
              <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor={colors.muted}
                secureTextEntry
                value={password}
                onChangeText={setPassword}
              />

              <Pressable style={styles.primaryBtn} onPress={handleLogin} disabled={loading}>
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.primaryBtnText}>Sign in</Text>
                )}
              </Pressable>

              <Pressable
                style={styles.demoBtn}
                onPress={() => {
                  setEmail(DEMO_ACCOUNT.email);
                  setPassword(DEMO_PASSWORD);
                }}
              >
                <Text style={styles.demoText}>
                  Demo: {DEMO_ACCOUNT.email} / {DEMO_PASSWORD}
                </Text>
              </Pressable>

              <Link href="/(auth)/register" style={styles.link}>
                Create a job seeker account
              </Link>
            </View>
          </GlassSurface>
        </ScrollView>
      </KeyboardAvoidingView>
    </GlassBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: spacing.lg,
    justifyContent: "center",
  },
  hero: { alignItems: "center", marginBottom: spacing.xl },
  brandRow: { marginBottom: spacing.sm },
  subtitle: { color: colors.muted, marginTop: 4 },
  formCard: { borderRadius: radius.xl },
  formInner: { padding: spacing.lg, backgroundColor: "rgba(255,255,255,0.55)" },
  title: { fontSize: 24, fontWeight: "700", color: colors.ink },
  text: { color: colors.muted, marginTop: 6, marginBottom: spacing.md },
  error: { color: colors.error, marginBottom: spacing.sm },
  input: {
    backgroundColor: "#fff",
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 14,
    marginBottom: spacing.sm,
    fontSize: 15,
  },
  primaryBtn: {
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: spacing.sm,
  },
  primaryBtnText: { color: "#fff", fontWeight: "700", fontSize: 16 },
  demoBtn: { marginTop: spacing.md, alignItems: "center" },
  demoText: { color: colors.primary, fontSize: 13, fontWeight: "600" },
  link: {
    marginTop: spacing.lg,
    textAlign: "center",
    color: colors.primary,
    fontWeight: "600",
  },
});
