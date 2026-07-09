import { Ionicons } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import { router } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import BrandLogo from "../../components/BrandLogo";
import MatchRing from "../../components/MatchRing";
import PrimaryButton from "../../components/PrimaryButton";
import ScreenBackground from "../../components/ScreenBackground";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../services/api.js";
import { colors, radius, shadow, spacing } from "../../constants/theme";

export default function UploadResumeScreen() {
  const insets = useSafeAreaInsets();
  const { refreshUser } = useAuth();
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const pickFile = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: [
        "application/pdf",
        "text/plain",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ],
      copyToCacheDirectory: true,
    });
    if (!result.canceled && result.assets?.[0]) {
      setFile(result.assets[0]);
      setError("");
    }
  };

  const continueFlow = async () => {
    if (!file) return;
    setLoading(true);
    setError("");
    try {
      await api.users.uploadCv({
        uri: file.uri,
        name: file.name,
        type: file.mimeType || "application/octet-stream",
      });
      await refreshUser();
      router.replace("/(tabs)");
    } catch (err) {
      setError(err.message || "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenBackground>
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + spacing.md,
          paddingHorizontal: spacing.lg,
          paddingBottom: insets.bottom + spacing.xl,
        }}
      >
        <View style={styles.brandRow}>
          <BrandLogo size="xl" />
        </View>

        <Text style={styles.pageTitle}>Upload Resume</Text>

        <View style={[styles.card, shadow.card]}>
          <View style={styles.dropZone}>
            <View style={styles.dropIcon}>
              <Ionicons name="document-text-outline" size={28} color={colors.muted} />
            </View>
            <Text style={styles.dropTitle}>Drag and drop your resume</Text>
            <Text style={styles.dropHint}>Supported formats: PDF, DOCX (Max 10MB)</Text>
          </View>

          <PrimaryButton title="Select File" onPress={pickFile} variant="outline" />

          {file ? <Text style={styles.fileName}>Selected: {file.name}</Text> : null}
          {error ? <Text style={styles.error}>{error}</Text> : null}

          <Text style={styles.aiHint}>
            Don&apos;t have a resume? <Text style={styles.aiLink}>Build one with AI</Text>
          </Text>

          <PrimaryButton
            title="Continue"
            onPress={continueFlow}
            loading={loading}
            disabled={!file}
          />
        </View>

        <View style={styles.statsRow}>
          <View style={[styles.statCard, shadow.card]}>
            <MatchRing score={file ? 72 : 0} size={52} label="MATCH" />
            <View>
              <Text style={styles.statTitle}>Live Match Score</Text>
              <Text style={styles.statMeta}>Precision Grade</Text>
            </View>
          </View>
          <View style={[styles.statCard, shadow.card]}>
            <View style={styles.bolt}>
              <Ionicons name="flash" size={18} color={colors.primary} />
            </View>
            <View>
              <Text style={styles.statTitle}>Estimated Time</Text>
              <Text style={styles.statMeta}>~45s Processing</Text>
            </View>
          </View>
        </View>

        <View style={styles.bottomCopy}>
          <Text style={styles.bottomTitle}>
            Tell us about your <Text style={styles.bottomAccent}>experience.</Text>
          </Text>
          <Text style={styles.bottomBody}>
            Our AI analyzes your career path, hidden skills, and strengths to surface the best opportunities for you.
          </Text>
        </View>

        <Pressable onPress={() => router.replace("/(tabs)")} style={styles.skip}>
          <Text style={styles.skipText}>Skip for now</Text>
        </Pressable>
      </ScrollView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  brandRow: { alignItems: "center", marginBottom: spacing.lg },
  pageTitle: { fontSize: 24, fontWeight: "800", color: colors.ink, marginBottom: spacing.md },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    gap: 12,
  },
  dropZone: {
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.lg,
    alignItems: "center",
    marginBottom: 4,
  },
  dropIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.background,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  dropTitle: { fontSize: 18, fontWeight: "800", color: colors.ink, textAlign: "center" },
  dropHint: { color: colors.muted, marginTop: 6, fontSize: 13, textAlign: "center" },
  fileName: { color: colors.primary, fontWeight: "600", fontSize: 13 },
  error: { color: colors.error },
  aiHint: { textAlign: "center", color: colors.muted, fontSize: 14 },
  aiLink: { color: colors.primary, fontWeight: "700" },
  statsRow: { flexDirection: "row", gap: 12, marginBottom: spacing.lg },
  statCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  statTitle: { fontSize: 13, fontWeight: "700", color: colors.ink },
  statMeta: { fontSize: 12, color: colors.muted, marginTop: 2 },
  bolt: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },
  bottomCopy: { marginTop: spacing.sm },
  bottomTitle: { fontSize: 28, fontWeight: "900", color: colors.ink, lineHeight: 34 },
  bottomAccent: { color: colors.primary },
  bottomBody: { color: colors.muted, marginTop: 10, lineHeight: 22, fontSize: 15 },
  skip: { alignItems: "center", marginTop: spacing.lg },
  skipText: { color: colors.primary, fontWeight: "700" },
});
