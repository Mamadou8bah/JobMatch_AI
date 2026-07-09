import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import MatchRing from "../../components/MatchRing";
import PrimaryButton from "../../components/PrimaryButton";
import ScreenBackground from "../../components/ScreenBackground";
import ScreenHeader from "../../components/ScreenHeader";
import { api } from "../../services/api.js";
import { colors, radius, shadow, spacing } from "../../constants/theme";

export default function ApplyScreen() {
  const { id } = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  const [job, setJob] = useState(null);
  const [coverLetter, setCoverLetter] = useState("");
  const [loading, setLoading] = useState(false);
  const [jobLoading, setJobLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api.jobs
      .get(id)
      .then(setJob)
      .finally(() => setJobLoading(false));
  }, [id]);

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

  if (jobLoading) {
    return (
      <ScreenBackground style={styles.center}>
        <ActivityIndicator color={colors.primary} size="large" />
      </ScreenBackground>
    );
  }

  const company = job?.employer?.companyName || job?.employer?.fullName || "Company";
  const score = job?.match?.score;

  return (
    <ScreenBackground>
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + spacing.md,
          paddingHorizontal: spacing.lg,
          paddingBottom: insets.bottom + spacing.xl,
        }}
      >
        <ScreenHeader title="Apply" />

        {job ? (
          <View style={[styles.preview, shadow.card]}>
            <View style={styles.previewTop}>
              <View>
                <Text style={styles.previewCompany}>{company}</Text>
                <Text style={styles.previewTitle}>{job.title}</Text>
                <Text style={styles.previewMeta}>{job.location}</Text>
              </View>
              {score != null ? <MatchRing score={score} size={56} /> : null}
            </View>
          </View>
        ) : null}

        <View style={[styles.card, shadow.card]}>
          <Text style={styles.title}>Cover letter</Text>
          <Text style={styles.subtitle}>Optional — tell the employer why you&apos;re a great fit</Text>
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <TextInput
            style={styles.input}
            multiline
            value={coverLetter}
            onChangeText={setCoverLetter}
            placeholder="Why are you a good fit for this role?"
            placeholderTextColor={colors.muted}
          />
          <PrimaryButton title="Submit application" onPress={submit} loading={loading} />
          <PrimaryButton title="Cancel" onPress={() => router.back()} variant="outline" />
        </View>
      </ScrollView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  preview: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  previewTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", gap: 12 },
  previewCompany: { color: colors.muted, fontWeight: "600" },
  previewTitle: { fontSize: 20, fontWeight: "800", color: colors.ink, marginTop: 4 },
  previewMeta: { color: colors.muted, marginTop: 4 },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.lg,
    gap: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  title: { fontSize: 18, fontWeight: "800", color: colors.ink },
  subtitle: { color: colors.muted, marginBottom: spacing.sm },
  error: { color: colors.error },
  input: {
    minHeight: 140,
    backgroundColor: colors.background,
    borderRadius: radius.md,
    padding: spacing.md,
    textAlignVertical: "top",
    borderWidth: 1,
    borderColor: colors.border,
  },
});
