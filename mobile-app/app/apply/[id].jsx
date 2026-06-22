import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import GlassBackground from "../../components/GlassBackground";
import { api } from "../../services/api.js";
import { colors, radius, spacing } from "../../constants/theme";

export default function ApplyScreen() {
  const { id } = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  const [coverLetter, setCoverLetter] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async () => {
    setLoading(true);
    setError("");
    try {
      await api.applications.apply(id, coverLetter || undefined);
      router.replace("/(tabs)/applications");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <GlassBackground>
      <View style={[styles.container, { paddingTop: insets.top + spacing.lg }]}>
        <View style={styles.card}>
          <Text style={styles.title}>Submit application</Text>
          <Text style={styles.subtitle}>Add an optional cover letter</Text>
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <TextInput
            style={styles.input}
            multiline
            value={coverLetter}
            onChangeText={setCoverLetter}
            placeholder="Why are you a good fit?"
            placeholderTextColor={colors.muted}
          />
          <Pressable style={styles.primaryBtn} onPress={submit} disabled={loading}>
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.primaryBtnText}>Submit</Text>
            )}
          </Pressable>
          <Pressable onPress={() => router.back()}>
            <Text style={styles.cancel}>Cancel</Text>
          </Pressable>
        </View>
      </View>
    </GlassBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: spacing.lg },
  card: { backgroundColor: "#fff", borderRadius: radius.xl, padding: spacing.lg },
  title: { fontSize: 22, fontWeight: "800", color: colors.ink },
  subtitle: { color: colors.muted, marginTop: 4, marginBottom: spacing.md },
  error: { color: colors.error, marginBottom: spacing.sm },
  input: {
    minHeight: 140,
    backgroundColor: "#F4F4F5",
    borderRadius: radius.md,
    padding: spacing.md,
    textAlignVertical: "top",
    marginBottom: spacing.md,
  },
  primaryBtn: {
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
    paddingVertical: 14,
    alignItems: "center",
  },
  primaryBtnText: { color: "#fff", fontWeight: "700" },
  cancel: { textAlign: "center", color: colors.primary, marginTop: spacing.md, fontWeight: "600" },
});
