import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors, radius, shadow, spacing } from "../constants/theme";

const COMPANY_COLORS = {
  Google: "#4285F4",
  Microsoft: "#00A4EF",
  Atlantic: "#6366F1",
  Insight: "#0EA5E9",
  JobMatch: "#3B82F6",
};

function companyColor(name = "") {
  const key = Object.keys(COMPANY_COLORS).find((k) =>
    name.toLowerCase().includes(k.toLowerCase())
  );
  return key ? COMPANY_COLORS[key] : colors.primary;
}

function formatSalary(job) {
  if (job.salaryMin && job.salaryMax) {
    return `$${Math.round(job.salaryMin / 1000)}k–$${Math.round(job.salaryMax / 1000)}k /Year`;
  }
  if (job.salaryMin) return `$${Math.round(job.salaryMin / 1000)}k /Year`;
  return "$150k /Year";
}

export default function JobCard({ job, onPress, onApply, applied, saved, onToggleSave }) {
  const company = job.employer?.companyName || job.employer?.fullName || "Company";
  const initial = company.slice(0, 1).toUpperCase();
  const score = job.match?.score;

  return (
    <View style={[styles.card, shadow.card]}>
      <View style={styles.topRow}>
        <View style={styles.companyRow}>
          <View style={[styles.logo, { backgroundColor: companyColor(company) }]}>
            <Text style={styles.logoText}>{initial}</Text>
          </View>
          <Text style={styles.company}>{company}</Text>
        </View>
        <View style={styles.iconRow}>
          <Pressable onPress={onToggleSave} style={styles.iconBtn}>
            <Ionicons
              name={saved ? "heart" : "heart-outline"}
              size={18}
              color={saved ? colors.error : colors.muted}
            />
          </Pressable>
          <Pressable style={styles.iconBtn}>
            <Ionicons name="ellipsis-vertical" size={18} color={colors.muted} />
          </Pressable>
        </View>
      </View>

      <Text style={styles.title}>{job.title}</Text>

      <View style={styles.tags}>
        <Tag text={job.location || "Remote"} />
        <Tag text={job.employmentType || "Full time"} />
        <Tag text={job.experienceLevel || "Mid"} />
      </View>

      <Text style={styles.salary}>{formatSalary(job)}</Text>

      <View style={styles.footer}>
        <View style={styles.applicants}>
          <View style={styles.avatarStack}>
            <View style={[styles.avatar, { backgroundColor: "#F59E0B" }]} />
            <View style={[styles.avatar, styles.avatarOverlap, { backgroundColor: "#8B5CF6" }]} />
            <View style={[styles.avatar, styles.avatarOverlap, { backgroundColor: "#10B981" }]} />
          </View>
          <Text style={styles.applicantText}>20+ Apply</Text>
        </View>

        {score != null && (
          <View style={styles.matchPill}>
            <Text style={styles.matchText}>{Math.round(score)}% match</Text>
          </View>
        )}
      </View>

      <Pressable
        style={[styles.cta, applied && styles.ctaApplied]}
        onPress={applied ? onPress : onApply || onPress}
      >
        <Text style={styles.ctaText}>{applied ? "Applied" : "See Details"}</Text>
        {!applied && <Ionicons name="arrow-up-outline" size={16} color="#fff" style={styles.ctaIcon} />}
      </Pressable>
    </View>
  );
}

function Tag({ text }) {
  return (
    <View style={styles.tag}>
      <Text style={styles.tagText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.xl,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  companyRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  logo: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  logoText: { color: "#fff", fontWeight: "700", fontSize: 16 },
  company: { fontSize: 15, fontWeight: "600", color: colors.ink },
  iconRow: { flexDirection: "row", gap: 8 },
  iconBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.tagBg,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: colors.ink,
    marginBottom: spacing.sm,
    lineHeight: 28,
  },
  tags: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: spacing.md },
  tag: {
    backgroundColor: colors.tagBg,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.pill,
  },
  tagText: { fontSize: 12, color: colors.muted, fontWeight: "500" },
  salary: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.primary,
    marginBottom: spacing.md,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  applicants: { flexDirection: "row", alignItems: "center", gap: 8 },
  avatarStack: { flexDirection: "row" },
  avatar: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: "#fff" },
  avatarOverlap: { marginLeft: -8 },
  applicantText: { fontSize: 13, color: colors.muted, fontWeight: "500" },
  matchPill: {
    backgroundColor: "#EFF6FF",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.pill,
  },
  matchText: { color: colors.primary, fontSize: 12, fontWeight: "700" },
  cta: {
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  ctaApplied: { backgroundColor: colors.muted },
  ctaText: { color: "#fff", fontWeight: "700", fontSize: 15 },
  ctaIcon: { transform: [{ rotate: "45deg" }] },
});
