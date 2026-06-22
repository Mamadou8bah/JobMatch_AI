import { router } from "expo-router";
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
import { colors, radius, spacing } from "../../constants/theme";

export default function RegisterScreen() {
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
      router.replace("/(tabs)");
    } catch (err) {
      setError(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <GlassBackground>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView contentContainerStyle={styles.container}>
          <View style={styles.hero}>
            <BrandLogo size="sm" />
          </View>

          <GlassSurface style={styles.formCard}>
            <View style={styles.formInner}>
              <Text style={styles.title}>Create account</Text>
              <Text style={styles.text}>Join as a job seeker in The Gambia</Text>
              {error ? <Text style={styles.error}>{error}</Text> : null}

              <TextInput style={styles.input} placeholder="Full name" value={fullName} onChangeText={setFullName} />
              <TextInput
                style={styles.input}
                placeholder="Email"
                autoCapitalize="none"
                keyboardType="email-address"
                value={email}
                onChangeText={setEmail}
              />
              <TextInput
                style={styles.input}
                placeholder="Password (min 6)"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
              />

              <Pressable style={styles.primaryBtn} onPress={handleRegister} disabled={loading}>
                {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryBtnText}>Sign up</Text>}
              </Pressable>

              <Pressable onPress={() => router.back()}>
                <Text style={styles.link}>Already have an account? Sign in</Text>
              </Pressable>
            </View>
          </GlassSurface>
        </ScrollView>
      </KeyboardAvoidingView>
    </GlassBackground>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: spacing.lg, justifyContent: "center" },
  hero: { alignItems: "center", marginBottom: spacing.lg },
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
  link: { marginTop: spacing.lg, textAlign: "center", color: colors.primary, fontWeight: "600" },
});
