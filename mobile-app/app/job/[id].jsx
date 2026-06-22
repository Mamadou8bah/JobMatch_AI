import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import GlassBackground from "../../components/GlassBackground";
import { api } from "../../services/api.js";
import { colors, radius, spacing } from "../../constants/theme";

export default function JobDetailScreen() {
  const { id } = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  const [job, setJob] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await api.jobs.get(id);
        let match = data.match;

        if (!match?.score) {
          try {
            match = await api.ai.matchScore(id);
          } catch {
            match = data.match;
          }
        }

        const nextJob = { ...data, match };
        setJob(nextJob);

        const missingSkills = match?.missingSkills || [];
        if (missingSkills.length) {
          try {
            const personalized = await api.training.personalized(id);
            setRecommendations(personalized.recommendations || []);
          } catch {
            try {
              const fallback = await api.ai.trainingRecommendations(missingSkills);
              setRecommendations(fallback.recommendations || []);
            } catch {
              setRecommendations([]);
            }
          }
        }
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  if (loading) {
    return (
      <GlassBackground style={styles.center}>
        <ActivityIndicator color={colors.primary} size="large" />
      </GlassBackground>
    );
  }

  if (!job) {
    return (
      <GlassBackground style={styles.center}>
        <Text>Job not found</Text>
      </GlassBackground>
    );
  }

  return (
    <GlassBackground>
      <ScrollView contentContainerStyle={{ paddingTop: insets.top + spacing.md, padding: spacing.lg, paddingBottom: 40 }}>
        <Pressable style={styles.close} onPress={() => router.back()}>
          <Ionicons name="close" size={22} color={colors.ink} />
        </Pressable>

        <View style={styles.card}>
          <Text style={styles.company}>{job.employer?.companyName || job.employer?.fullName}</Text>
          <Text style={styles.title}>{job.title}</Text>
          <Text style={styles.meta}>
            {job.location} · {job.employmentType} · {job.experienceLevel}
          </Text>
          {job.match?.score != null && (
            <Text style={styles.match}>{Math.round(job.match.score)}% AI match</Text>
          )}
          <Text style={styles.description}>{job.description}</Text>
          <View style={styles.tags}>
            {(job.requiredSkills || []).map((skill) => (
              <View key={skill} style={styles.tag}>
                <Text style={styles.tagText}>{skill}</Text>
              </View>
            ))}
          </View>

          {job.match?.matchedSkills?.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Skills you have</Text>
              <View style={styles.tags}>
                {job.match.matchedSkills.map((skill) => (
                  <View key={skill} style={[styles.tag, styles.tagMatched]}>
                    <Text style={[styles.tagText, styles.tagMatchedText]}>{skill}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {job.match?.missingSkills?.length > 0 ? (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Skills to develop</Text>
              <View style={styles.tags}>
                {job.match.missingSkills.map((skill) => (
                  <View key={skill} style={[styles.tag, styles.tagMissing]}>
                    <Text style={[styles.tagText, styles.tagMissingText]}>{skill}</Text>
                  </View>
                ))}
              </View>
            </View>
          ) : job.match?.score != null ? (
            <Text style={styles.goodMatch}>You match all required skills for this role.</Text>
          ) : null}

          {recommendations.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Recommended courses</Text>
              {recommendations.map((rec, index) => (
                <View key={`${rec.title}-${index}`} style={styles.recCard}>
                  <Text style={styles.recTitle}>{rec.title}</Text>
                  <Text style={styles.recMeta}>
                    {[rec.provider, rec.skill].filter(Boolean).join(" · ")}
                  </Text>
                  {rec.description ? <Text style={styles.recDesc}>{rec.description}</Text> : null}
                  {rec.url ? (
                    <Pressable onPress={() => Linking.openURL(rec.url)}>
                      <Text style={styles.recLink}>View course</Text>
                    </Pressable>
                  ) : null}
                </View>
              ))}
            </View>
          )}

          <Pressable style={styles.cta} onPress={() => router.push(`/apply/${job.id}`)}>
            <Text style={styles.ctaText}>Apply now</Text>
          </Pressable>
          <Pressable
            style={styles.secondary}
            onPress={async () => {
              const employerId = job.employer?.id || job.employerId;
              if (employerId) {
                await api.chat.createThread(employerId, job.id);
                router.push("/(tabs)/messages");
              }
            }}
          >
            <Text style={styles.secondaryText}>Message employer</Text>
          </Pressable>
        </View>
      </ScrollView>
    </GlassBackground>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  close: {
    alignSelf: "flex-end",
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.md,
  },
  card: { backgroundColor: "#fff", borderRadius: radius.xl, padding: spacing.lg },
  company: { color: colors.muted, fontWeight: "600" },
  title: { fontSize: 26, fontWeight: "800", color: colors.ink, marginTop: 6 },
  meta: { color: colors.muted, marginTop: 6 },
  match: { color: colors.primary, fontWeight: "700", marginTop: spacing.md },
  description: { color: colors.ink, lineHeight: 22, marginTop: spacing.md },
  tags: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: spacing.sm },
  tag: { backgroundColor: "#F4F4F5", paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999 },
  tagText: { color: colors.muted, fontSize: 12 },
  tagMatched: { backgroundColor: "#DCFCE7" },
  tagMatchedText: { color: "#166534" },
  tagMissing: { backgroundColor: "#FEE2E2" },
  tagMissingText: { color: "#B91C1C" },
  section: { marginTop: spacing.lg },
  sectionTitle: { fontWeight: "700", color: colors.ink, marginBottom: spacing.sm },
  goodMatch: { color: "#166534", fontWeight: "600", marginTop: spacing.lg },
  recCard: {
    backgroundColor: "#F9FAFB",
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  recTitle: { fontWeight: "700", color: colors.ink },
  recMeta: { color: colors.muted, fontSize: 12, marginTop: 4 },
  recDesc: { color: colors.ink, fontSize: 13, marginTop: 6, lineHeight: 18 },
  recLink: { color: colors.primary, fontWeight: "700", marginTop: 8 },
  cta: {
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: spacing.lg,
  },
  ctaText: { color: "#fff", fontWeight: "700" },
  secondary: { alignItems: "center", paddingVertical: 14 },
  secondaryText: { color: colors.primary, fontWeight: "700" },
});
