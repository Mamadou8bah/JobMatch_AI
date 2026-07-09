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
import MatchRing from "../../components/MatchRing";
import CompanyLogo from "../../components/CompanyLogo";
import PrimaryButton from "../../components/PrimaryButton";
import ScreenBackground from "../../components/ScreenBackground";
import ScreenHeader from "../../components/ScreenHeader";
import { useSavedJobs } from "../../hooks/useSavedJobs";
import { employerFromJob } from "../../utils/companyLogo";
import { api } from "../../services/api.js";
import { colors, radius, shadow, spacing } from "../../constants/theme";

function formatSalary(job) {
  if (job.salaryMin && job.salaryMax) {
    return `$${Math.round(job.salaryMin / 1000)}k–$${Math.round(job.salaryMax / 1000)}k / year`;
  }
  if (job.salaryMin) return `$${Math.round(job.salaryMin / 1000)}k / year`;
  return null;
}

export default function JobDetailScreen() {
  const { id } = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  const { isSaved, toggleSaved } = useSavedJobs();
  const [job, setJob] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingRecs, setLoadingRecs] = useState(false);
  const [applied, setApplied] = useState(false);
  const [premiumBlocked, setPremiumBlocked] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const [data, applications] = await Promise.all([
          api.jobs.get(id),
          api.applications.mine().catch(() => []),
        ]);

        setApplied(applications.some((a) => a.job?.id === id));

        let match = data.match;
        if (match?.score == null && !match?.matchBand) {
          try {
            match = await api.ai.matchScore(id);
          } catch {
            match = data.match;
          }
        }

        setJob({ ...data, match });
        setPremiumBlocked(Boolean(match?.premiumRequired));

        const missingSkills = match?.missingSkills || [];
        if (missingSkills.length) {
          setLoadingRecs(true);
          try {
            const personalized = await api.training.personalized(id);
            setRecommendations(personalized.recommendations || []);
          } catch (err) {
            if (err.isPremiumRequired) setPremiumBlocked(true);
            try {
              const fallback = await api.ai.trainingRecommendations(missingSkills);
              setRecommendations(fallback.recommendations || []);
            } catch (inner) {
              if (inner.isPremiumRequired) setPremiumBlocked(true);
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
      <ScreenBackground style={styles.center}>
        <ActivityIndicator color={colors.primary} size="large" />
      </ScreenBackground>
    );
  }

  if (!job) {
    return (
      <ScreenBackground style={styles.center}>
        <Text style={styles.notFound}>Job not found</Text>
        <PrimaryButton title="Go back" onPress={() => router.back()} variant="outline" />
      </ScreenBackground>
    );
  }

  const salary = formatSalary(job);
  const employer = employerFromJob(job);
  const score = job.match?.score;
  const matchBand = job.match?.matchBand;
  const missingSkills = job.match?.missingSkills || [];
  const matchedSkills = job.match?.matchedSkills || [];
  const saved = isSaved(job.id);

  return (
    <ScreenBackground style={styles.screen}>
      <View style={[styles.headerWrap, { paddingTop: insets.top + spacing.sm }]}>
        <ScreenHeader
          title="Job Details"
          showLogo
          right={
            <Pressable style={styles.saveBtn} onPress={() => toggleSaved(job.id)}>
              <Ionicons name={saved ? "heart" : "heart-outline"} size={22} color={saved ? colors.error : colors.ink} />
            </Pressable>
          }
        />
      </View>

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.hero, shadow.card]}>
          <View style={styles.heroTop}>
            <CompanyLogo
              name={employer.name}
              logoUrl={employer.logoUrl}
              employerId={employer.id}
              size={52}
              rounded={14}
            />
            {score != null || matchBand ? (
              <MatchRing score={score} band={matchBand} size={72} />
            ) : null}
          </View>
          <Text style={styles.company}>{employer.name}</Text>
          <Text style={styles.title}>{job.title}</Text>
          <Text style={styles.meta}>
            {[job.location, job.employmentType, job.experienceLevel].filter(Boolean).join(" · ")}
          </Text>
          {salary ? <Text style={styles.salary}>{salary}</Text> : null}
          {matchBand && score == null ? (
            <Pressable onPress={() => router.push("/billing")}>
              <Text style={styles.upgradeHint}>Unlock exact match % with Premium</Text>
            </Pressable>
          ) : null}
        </View>

        <View style={[styles.section, shadow.card]}>
          <Text style={styles.sectionTitle}>About this role</Text>
          <Text style={styles.description}>{job.description}</Text>
        </View>

        {(job.requiredSkills || []).length > 0 && (
          <View style={[styles.section, shadow.card]}>
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
          <View style={[styles.section, shadow.card]}>
            <View style={styles.sectionHeader}>
              <Ionicons name="checkmark-circle" size={18} color={colors.primary} />
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
          <View style={[styles.section, styles.missingSection, shadow.card]}>
            <View style={styles.sectionHeader}>
              <Ionicons name="alert-circle" size={18} color={colors.error} />
              <Text style={styles.sectionTitle}>Skills to develop</Text>
            </View>
            <Text style={styles.sectionHint}>Close these gaps to strengthen your application</Text>
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
            <Ionicons name="sparkles" size={18} color={colors.primaryDark} />
            <Text style={styles.goodMatchText}>You match all required skills for this role.</Text>
          </View>
        ) : null}

        {(missingSkills.length > 0 || loadingRecs || premiumBlocked) && (
          <View style={[styles.section, shadow.card]}>
            <View style={styles.sectionHeader}>
              <Ionicons name="school-outline" size={18} color={colors.primary} />
              <Text style={styles.sectionTitle}>Recommended courses</Text>
            </View>
            {loadingRecs ? (
              <ActivityIndicator color={colors.primary} style={{ marginTop: spacing.sm }} />
            ) : premiumBlocked && recommendations.length === 0 ? (
              <View style={{ gap: 10 }}>
                <Text style={styles.emptyRecs}>
                  Personalized course recommendations are included with Seeker Premium.
                </Text>
                <PrimaryButton title="Upgrade to Premium" onPress={() => router.push("/billing")} />
              </View>
            ) : recommendations.length > 0 ? (
              recommendations.map((rec, index) => (
                <View key={`${rec.title}-${index}`} style={styles.recCard}>
                  <Text style={styles.recTitle}>{rec.title}</Text>
                  <Text style={styles.recMeta}>{[rec.provider, rec.skill].filter(Boolean).join(" · ")}</Text>
                  {rec.description ? <Text style={styles.recDesc}>{rec.description}</Text> : null}
                  {rec.url ? (
                    <Pressable style={styles.recBtn} onPress={() => Linking.openURL(rec.url)}>
                      <Text style={styles.recBtnText}>View course</Text>
                      <Ionicons name="open-outline" size={14} color={colors.primary} />
                    </Pressable>
                  ) : null}
                </View>
              ))
            ) : (
              <Text style={styles.emptyRecs}>No course recommendations available right now.</Text>
            )}
          </View>
        )}

        <Pressable
          style={styles.messageBtn}
          onPress={async () => {
            const employerId = job.employer?.id || job.employerId;
            if (employerId) {
              const thread = await api.chat.createThread(employerId, job.id);
              router.push(`/chat/${thread.id}`);
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
            <Ionicons name="checkmark-circle" size={20} color={colors.primaryDark} />
            <Text style={styles.appliedText}>You already applied</Text>
          </View>
        ) : (
          <PrimaryButton
            title="Apply now"
            icon="arrow-forward"
            onPress={() => router.push(`/apply/${job.id}`)}
          />
        )}
      </View>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: spacing.lg, gap: 16 },
  notFound: { color: colors.ink, fontWeight: "600" },
  headerWrap: { paddingHorizontal: spacing.lg },
  saveBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  scroll: { paddingHorizontal: spacing.lg },
  hero: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  heroTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: spacing.sm },
  company: { color: colors.muted, fontWeight: "600", fontSize: 14 },
  title: { fontSize: 24, fontWeight: "800", color: colors.ink, marginTop: 4 },
  meta: { color: colors.muted, marginTop: 6, lineHeight: 20 },
  salary: { color: colors.primary, fontWeight: "700", fontSize: 16, marginTop: spacing.sm },
  upgradeHint: {
    color: colors.primary,
    fontWeight: "700",
    fontSize: 13,
    marginTop: spacing.sm,
  },
  section: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sectionHeader: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: spacing.sm },
  sectionTitle: { fontWeight: "700", color: colors.ink, fontSize: 16 },
  sectionHint: { color: colors.muted, fontSize: 13, marginBottom: spacing.sm },
  description: { color: colors.ink, lineHeight: 22 },
  tags: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  tag: {
    backgroundColor: colors.background,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.pill,
  },
  tagText: { color: colors.muted, fontSize: 12, fontWeight: "500" },
  tagMatched: { backgroundColor: colors.primaryLight },
  tagMatchedText: { color: colors.primaryDark },
  missingSection: { borderColor: "#FECACA" },
  tagMissing: { backgroundColor: "#FEE2E2" },
  tagMissingText: { color: colors.error },
  goodMatchBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: colors.primaryLight,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  goodMatchText: { color: colors.primaryDark, fontWeight: "600", flex: 1 },
  recCard: {
    backgroundColor: colors.background,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  recTitle: { fontWeight: "700", color: colors.ink },
  recMeta: { color: colors.muted, fontSize: 12, marginTop: 4 },
  recDesc: { color: colors.ink, fontSize: 13, marginTop: 6, lineHeight: 18 },
  recBtn: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 10 },
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
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  appliedPill: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: colors.primaryLight,
    borderRadius: radius.pill,
    paddingVertical: 16,
  },
  appliedText: { color: colors.primaryDark, fontWeight: "700", fontSize: 15 },
});
