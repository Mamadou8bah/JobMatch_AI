import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";
import CompanyLogo from "./CompanyLogo";
import GlassPanel from "./GlassPanel";
import MatchRing from "./MatchRing";
import { employerFromJob } from "../utils/companyLogo";
import { colors, radius, spacing } from "../constants/theme";

export default function JobCard({ job, onPress, applied, saved, onToggleSave }) {
  const employer = employerFromJob(job);
  const score = job.match?.score;
  const band = job.match?.matchBand;
  const tags = [
    job.employmentType || "Full-time",
    ...(job.requiredSkills || []).slice(0, 2),
  ].filter(Boolean);

  return (
    <Pressable onPress={onPress} accessibilityRole="button">
      <GlassPanel borderRadius={radius.xl} style={styles.wrap} contentStyle={styles.card}>
        <View style={styles.topRow}>
          <CompanyLogo
            name={employer.name}
            logoUrl={employer.logoUrl}
            employerId={employer.id}
            size={42}
            rounded={12}
          />
          <View style={styles.topActions}>
            {onToggleSave ? (
              <Pressable
                style={styles.saveBtn}
                onPress={(e) => {
                  e?.stopPropagation?.();
                  onToggleSave();
                }}
                hitSlop={8}
              >
                <Ionicons
                  name={saved ? "heart" : "heart-outline"}
                  size={22}
                  color={saved ? colors.error : colors.muted}
                />
              </Pressable>
            ) : null}
            <MatchRing score={score} band={band} size={54} />
          </View>
        </View>

        <Text style={styles.title}>{job.title}</Text>
        <Text style={styles.company}>{employer.name}</Text>

        <View style={styles.tags}>
          {tags.map((tag) => (
            <View key={tag} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
        </View>

        <View style={styles.footer}>
          <View style={styles.locationRow}>
            <Ionicons name="location-outline" size={14} color={colors.muted} />
            <Text style={styles.location}>{job.location || "The Gambia"}</Text>
          </View>
          <View style={[styles.ctaBtn, applied && styles.ctaBtnDone]}>
            <Text style={styles.ctaText}>{applied ? "View details" : "View job"}</Text>
            <Ionicons name="chevron-forward" size={14} color="#fff" />
          </View>
        </View>
      </GlassPanel>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: spacing.md },
  card: { padding: spacing.lg },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: spacing.md,
  },
  topActions: { flexDirection: "row", alignItems: "center", gap: 8 },
  saveBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.5)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.65)",
    alignItems: "center",
    justifyContent: "center",
  },
  title: { fontSize: 20, fontWeight: "800", color: colors.ink, marginBottom: 4 },
  company: { color: colors.muted, fontSize: 14, marginBottom: spacing.md },
  tags: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: spacing.md },
  tag: {
    backgroundColor: colors.tagBg,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.5)",
  },
  tagText: { fontSize: 12, fontWeight: "600", color: colors.tagText, textTransform: "capitalize" },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  locationRow: { flexDirection: "row", alignItems: "center", gap: 4, flex: 1 },
  location: { color: colors.muted, fontSize: 13 },
  ctaBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.25)",
  },
  ctaBtnDone: { backgroundColor: colors.muted },
  ctaText: { color: "#fff", fontWeight: "800", fontSize: 13 },
});
