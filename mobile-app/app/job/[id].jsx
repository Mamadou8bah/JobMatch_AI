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

function formatSalary(job) {
  if (job.salaryMin && job.salaryMax) {
    return `$${Math.round(job.salaryMin / 1000)}k–$${Math.round(job.salaryMax / 1000)}k / year`;
  }
  if (job.salaryMin) return `$${Math.round(job.salaryMin / 1000)}k / year`;
  return null;
}

function companyInitial(name = "C") {
  return name.slice(0, 1).toUpperCase();
}

export default function JobDetailScreen() {
  const { id } = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  const [job, setJob] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingRecs, setLoadingRecs] = useState(false);
  const [applied, setApplied] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const [data, applications] = await Promise.all([
          api.jobs.get(id),
          api.applications.mine().catch(() => []),
        ]);

        setApplied(applications.some((a) => a.job?.id === id));

        let match = data.match;
        if (!match?.score) {
          try {
            match = await api.ai.matchScore(id);
          } catch {
            match = data.match;
          }
        }

        setJob({ ...data, match });

        const missingSkills = match?.missingSkills || [];
        if (missingSkills.length) {
          setLoadingRecs(true);
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
          } finally {
            setLoadingRecs(false);
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
        <Text style={styles.notFound}>Job not found</Text>
        <Pressable style={styles.backLink} onPress={() => router.back()}>
          <Text style={styles.backLinkText}>Go back</Text>
        </Pressable>
      </GlassBackground>
    );
  }

  const salary = formatSalary(job);
  const score = job.match?.score;
  const missingSkills = job.match?.missingSkills || [];
  const matchedSkills = job.match?.matchedSkills || [];

  return (
    <GlassBackground style={styles.screen}>
      <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
        <Pressable style={styles.headerBtn} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={22} color={colors.ink} />
        </Pressable>
        <Text style={styles.headerTitle}>Job Details</Text>
        <View style={styles.headerBtn} />
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingBottom: insets.bottom + 100 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.hero}>
          <View style={styles.logo}>
            <Text style={styles.logoText}>
              {companyInitial(job.employer?.companyName || job.employer?.fullName)}
            </Text>
          </View>
          <Text style={styles.company}>
            {job.employer?.companyName || job.employer?.fullName}
          </Text>
          <Text style={styles.title}>{job.title}</Text>
          <Text style={styles.meta}>
            {[job.location, job.employmentType, job.experienceLevel]
              .filter(Boolean)
              .join(" · ")}
          </Text>
          {salary ? <Text style={styles.salary}>{salary}</Text> : null}

          {score != null && (
            <View style={styles.matchCard}>
              <View style={styles.matchTop}>
                <Text style={styles.matchLabel}>AI match score</Text>
                <Text style={styles.matchValue}>{Math.round(score)}%</Text>
              </View>
              <View style={styles.matchBar}>
                <View style={[styles.matchFill, { width: `${Math.min(score, 100)}%` }]} />
              </View>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About this role</Text>
          <Text style={styles.description}>{job.description}</Text>
        </View>

        {(job.requiredSkills || []).length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Required skills</Text>
            <View style={styles.tags}>
              {job.requiredSkills.map((skill) => (
                <View key={skill} style={styles.tag}>
                  <Text style={styles.tagText}>{skill}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {matchedSkills.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="checkmark-circle" size={18} color="#16A34A" />
              <Text style={styles.sectionTitle}>Skills you have</Text>
            </View>
            <View style={styles.tags}>
              {matchedSkills.map((skill) => (
                <View key={skill} style={[styles.tag, styles.tagMatched]}>
                  <Text style={[styles.tagText, styles.tagMatchedText]}>{skill}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {missingSkills.length > 0 ? (
          <View style={[styles.section, styles.missingSection]}>
            <View style={styles.sectionHeader}>
              <Ionicons name="alert-circle" size={18} color="#DC2626" />
              <Text style={styles.sectionTitle}>Skills to develop</Text>
            </View>
            <Text style={styles.sectionHint}>
              Close these gaps to strengthen your application
            </Text>
            <View style={styles.tags}>
              {missingSkills.map((skill) => (
                <View key={skill} style={[styles.tag, styles.tagMissing]}>
                  <Text style={[styles.tagText, styles.tagMissingText]}>{skill}</Text>
                </View>
              ))}
            </View>
          </View>
        ) : score != null ? (
          <View style={styles.goodMatchBanner}>
            <Ionicons name="sparkles" size={18} color="#166534" />
            <Text style={styles.goodMatchText}>
              You match all required skills for this role.
            </Text>
          </View>
        ) : null}

        {(missingSkills.length > 0 || loadingRecs) && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="school-outline" size={18} color={colors.primary} />
              <Text style={styles.sectionTitle}>Recommended courses</Text>
            </View>
            {loadingRecs ? (
              <ActivityIndicator color={colors.primary} style={{ marginTop: spacing.sm }} />
            ) : recommendations.length > 0 ? (
              recommendations.map((rec, index) => (
                <View key={`${rec.title}-${index}`} style={styles.recCard}>
                  <Text style={styles.recTitle}>{rec.title}</Text>
                  <Text style={styles.recMeta}>
                    {[rec.provider, rec.skill].filter(Boolean).join(" · ")}
                  </Text>
                  {rec.description ? (
                    <Text style={styles.recDesc}>{rec.description}</Text>
                  ) : null}
                  {rec.url ? (
                    <Pressable
                      style={styles.recBtn}
                      onPress={() => Linking.openURL(rec.url)}
                    >
                      <Text style={styles.recBtnText}>View course</Text>
                      <Ionicons name="open-outline" size={14} color={colors.primary} />
                    </Pressable>
                  ) : null}
                </View>
              ))
            ) : (
              <Text style={styles.emptyRecs}>
                No course recommendations available right now.
              </Text>
            )}
          </View>
        )}

        <Pressable
          style={styles.messageBtn}
          onPress={async () => {
            const employerId = job.employer?.id || job.employerId;
            if (employerId) {
              await api.chat.createThread(employerId, job.id);
              router.push("/(tabs)/messages");
            }
          }}
        >
          <Ionicons name="chatbubble-outline" size={18} color={colors.primary} />
          <Text style={styles.messageBtnText}>Message employer</Text>
        </Pressable>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.md }]}>
        {applied ? (
          <View style={styles.appliedPill}>
            <Ionicons name="checkmark-circle" size={20} color="#166534" />
            <Text style={styles.appliedText}>You already applied</Text>
          </View>
        ) : (
          <Pressable
            style={styles.applyBtn}
            onPress={() => router.push(`/apply/${job.id}`)}
          >
            <Text style={styles.applyBtnText}>Apply now</Text>
            <Ionicons name="arrow-forward" size={18} color="#fff" />
          </Pressable>
        )}
      </View>
    </GlassBackground>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  notFound: { color: colors.ink, fontWeight: "600" },
  backLink: { marginTop: spacing.md },
  backLinkText: { color: colors.primary, fontWeight: "700" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
  },
  headerBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.85)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: { fontSize: 16, fontWeight: "700", color: colors.ink },
  scroll: { paddingHorizontal: spacing.lg },
  hero: {
    backgroundColor: "#fff",
    borderRadius: radius.xl,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  logo: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.sm,
  },
  logoText: { color: "#fff", fontSize: 22, fontWeight: "800" },
  company: { color: colors.muted, fontWeight: "600", fontSize: 14 },
  title: { fontSize: 24, fontWeight: "800", color: colors.ink, marginTop: 4 },
  meta: { color: colors.muted, marginTop: 6, lineHeight: 20 },
  salary: {
    color: colors.primary,
    fontWeight: "700",
    fontSize: 16,
    marginTop: spacing.sm,
  },
  matchCard: {
    marginTop: spacing.md,
    backgroundColor: "#EFF6FF",
    borderRadius: radius.md,
    padding: spacing.md,
  },
  matchTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  matchLabel: { color: colors.muted, fontWeight: "600", fontSize: 13 },
  matchValue: { color: colors.primary, fontWeight: "800", fontSize: 22 },
  matchBar: {
    height: 8,
    backgroundColor: "#DBEAFE",
    borderRadius: 4,
    overflow: "hidden",
  },
  matchFill: {
    height: "100%",
    backgroundColor: colors.primary,
    borderRadius: 4,
  },
  section: {
    backgroundColor: "#fff",
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: spacing.sm,
  },
  sectionTitle: { fontWeight: "700", color: colors.ink, fontSize: 16 },
  sectionHint: { color: colors.muted, fontSize: 13, marginBottom: spacing.sm },
  description: { color: colors.ink, lineHeight: 22 },
  tags: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  tag: {
    backgroundColor: "#F4F4F5",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.pill,
  },
  tagText: { color: colors.muted, fontSize: 12, fontWeight: "500" },
  tagMatched: { backgroundColor: "#DCFCE7" },
  tagMatchedText: { color: "#166534" },
  missingSection: { borderWidth: 1, borderColor: "#FECACA" },
  tagMissing: { backgroundColor: "#FEE2E2" },
  tagMissingText: { color: "#B91C1C" },
  goodMatchBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#DCFCE7",
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  goodMatchText: { color: "#166534", fontWeight: "600", flex: 1 },
  recCard: {
    backgroundColor: "#F9FAFB",
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  recTitle: { fontWeight: "700", color: colors.ink },
  recMeta: { color: colors.muted, fontSize: 12, marginTop: 4 },
  recDesc: { color: colors.ink, fontSize: 13, marginTop: 6, lineHeight: 18 },
  recBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 10,
  },
  recBtnText: { color: colors.primary, fontWeight: "700", fontSize: 14 },
  emptyRecs: { color: colors.muted, fontSize: 13 },
  messageBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: spacing.md,
    marginBottom: spacing.sm,
  },
  messageBtnText: { color: colors.primary, fontWeight: "700" },
  footer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    backgroundColor: "rgba(255,255,255,0.95)",
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.06)",
  },
  applyBtn: {
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  applyBtnText: { color: "#fff", fontWeight: "700", fontSize: 16 },
  appliedPill: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#DCFCE7",
    borderRadius: radius.pill,
    paddingVertical: 16,
  },
  appliedText: { color: "#166534", fontWeight: "700", fontSize: 15 },
});
